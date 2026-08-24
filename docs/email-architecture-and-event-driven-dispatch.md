# Bağımsız ve Olay Güdümlü E-Posta Mimarisi (Event-Driven Email Dispatch Architecture)

Bu doküman, **secondHand** platformundaki e-posta gönderim altyapısının JVM içi bellek bağımlılıklarından kurtarılarak **Apache Kafka tabanlı, dağıtık, sıfır veri kayıplı (zero message loss) ve idempotent** bir mimariye dönüştürülmesini detaylandırmaktadır.

---

## 1. Mimari Dönüşümün Amacı ve Kapsamı

### 🚨 Eski Mimari ve Riskleri (In-Memory Spring ApplicationEvents)
* **Veri Kaybı Riski:** Domain servisleri Spring'in JVM içi `ApplicationEventPublisher`'ı üzerinden olay fırlatıyordu. Sunucunun yeniden başlaması (crash/deploy) anında henüz işlenmemiş mailler kayboluyordu.
* **Sıkı Bağlantı (Tight Coupling):** Domain servisleri (`PaymentNotificationService`, `UserNotificationService`) içerisine `StringBuilder` ile doğrudan HTML tag'leri, tablo stilleri ve şablon mantığı gömülmüştü.
* **Mükerrer Gönderim / Çakışma:** Yatay ölçeklemede (multiple app nodes) rate limiter ve retry mekanizması tek bir JVM heap'ine bağımlıydı.

---

## 2. Yeni Event-Driven Dağıtık Mimari

```
[ Domain Katmanı (Payment / Order / User / Offer) ]
                        │
                        ▼ (Pure Data Model / DTO)
             [ EmailEventPublisher ]
                        │
                        ▼ (JSON Serialization)
             [ EmailKafkaProducer ]
                        │
                        ▼ (At-Least-Once Delivery)
       ┌─────────────────────────────────────────┐
       │   Apache Kafka Topic: `mail.dispatch.v1` │ (3 Partitions)
       └─────────────────────────────────────────┘
                        │
                        ▼ (Consumer Group: `mail-dispatch-consumers`)
             [ EmailKafkaConsumer ]
                        │
       ┌────────────────┴────────────────────────┐
       ▼                                         ▼
[ Atomic Idempotency Check ]           [ Thymeleaf Template Engine ]
(processed_kafka_events DB)           (payments/receipt.html, etc.)
       │                                         │
       └────────────────┬────────────────────────┘
                        │
                        ▼
                [ Email Entity ] (Status: PENDING)
                        │
                        ▼
             [ RateLimitedEmailSender ]
                        │
       ┌────────────────┴────────────────────────┐
       ▼                                         ▼
[ SMTP / MailGun / SES Delivery ]      [ Retry / Dead Letter Queue ]
```

---

## 3. Temel Bileşenler ve Sözleşmeler

### A. Olay Sözleşmesi (`MailDispatchKafkaEvent.java`)
```java
public record MailDispatchKafkaEvent(
        UUID eventId,
        Long recipientUserId,
        String recipientEmail,
        String recipientName,
        String subject,
        EmailType emailType,
        EmailPriority priority,
        String templatePath,
        Map<String, Object> templateVariables,
        String customHtmlBody,
        LocalDateTime createdAt
) {}
```

### B. Olay Üretici (`EmailKafkaProducer.java`)
* Kafka üzerindeki `mail.dispatch.v1` konusuna olayları asenkron olarak yazar.
* Bölümleme anahtarı (partition key) olarak `recipientEmail` kullanılır; böylece aynı kullanıcıya giden mailler sıralı ve dengeli işlenir.

### C. Atomik Tüketici (`EmailKafkaConsumer.java`)
* `processed_kafka_events` tablosunda `mail:dispatch:{eventId}` anahtarı ile atomik `INSERT ON CONFLICT DO NOTHING` idempotency denetimi yapar.
* Şablon değişkenlerini (`templateVariables`) Thymeleaf motoruna (`EmailTemplateService`) aktararak saf ve zengin HTML çıktısı üretir.
* Gönderim öncesinde `emails` tablosuna `PENDING` statüsüyle kaydeder; ardından `EmailSender` üzerinden iletimi gerçekleştirir ve durumu `SENT` olarak günceller.

---

## 4. Temiz Veri Modeli ve Gelişmiş Şablonlar

Domain servisleri artık HTML string'leri oluşturmaz; sadece temiz veri alanlarını iletir:
```java
var data = GenericEmailData.builder()
        .userName(user.getName())
        .headerTitle("Ödeme Başarılı")
        .amount("350000.00")
        .currency("TRY")
        .transactionNumber("B2E9619A")
        .typeLabel("Ürün Satın Alma")
        .listingTitle("Stephen Curry 2015-16 jersey")
        .paymentMethod("E-Cüzdan")
        .transactionDate("24.08.2026 17:00")
        .actionText("Hesabımı Görüntüle")
        .actionUrl("/account/hub")
        .build();

emailEventPublisher.publish(new PaymentSuccessEmailEvent(user, subject, data));
```

Thymeleaf şablonu (`payments/receipt.html`), bu yapısal alanları otomatik olarak modern, kurumsal kart ve detay tablosu formatında derler.

---

## 5. Güvenilirlik ve İdempotency Matrisi

| Senaryo | Eski Davranış | Yeni Davranış |
| :--- | :--- | :--- |
| **Sunucu Yeniden Başlaması (Crash)** | Bellekteki mailler kaybolurdu. | Kafka broker'da saklanır, tüketici ayağa kalktığında kaldığı offset'ten devam eder. |
| **Aynı Olayın Tekrar Gelmesi** | Kullanıcıya mükerrer mail giderdi. | `processed_kafka_events` tablosu mükerrer ID'yi tespit edip atlar (`dedupeKey`). |
| **Domain Katmanı Bağımlılığı** | Domain servisleri HTML tag'leri içerirdi. | Domain sadece veri DTO'su üretir; şablon yönetimi tamamen `email` modülündedir. |
| **Alıcı / Satıcı Ayrımı** | Satıcıya da alıcının ödeme makbuzu gidebiliyordu. | Ödeme makbuzu yalnızca parayı ödeyen `fromUserId`'ye iletilir. |
