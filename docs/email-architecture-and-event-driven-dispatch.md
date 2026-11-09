# Bağımsız ve Event-Driven E-Posta Mimarisi

Bu doküman, **secondHand** platformundaki e-posta gönderim altyapısının JVM içi bellek bağımlılıklarından kurtarılarak **Apache Kafka tabanlı, consumer tarafında idempotent** bir mimariye dönüştürülmesini detaylandırmaktadır. Modül özeti: [`email/README.md`](../src/main/java/com/serhat/secondhand/email/README.md).

---

## 1. Mimari Dönüşümün Amacı ve Kapsamı

### Eski Mimari ve Riskleri (In-Memory Spring ApplicationEvents)
* **Veri Kaybı Riski:** Domain servisleri Spring'in JVM içi `ApplicationEventPublisher`'ı üzerinden olay fırlatıyordu. Sunucunun yeniden başlaması (crash/deploy) anında henüz işlenmemiş mailler kayboluyordu.
* **Sıkı Bağlantı (Tight Coupling):** Domain servisleri (`PaymentNotificationService`, `UserNotificationService`) içerisine `StringBuilder` ile doğrudan HTML tag'leri, tablo stilleri ve şablon mantığı gömülmüştü.
* **Yatay Ölçekleme:** Retry ve rate limiting tek bir JVM heap'ine bağımlıydı; Kafka consumer group ile iş node'lar arasında paylaşılır.

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
                        ▼ (async send, key = recipientEmail)
       ┌──────────────────────────────────────────────┐
       │ Kafka Topic: `mail.dispatch.v1` (3 partition) │
       └──────────────────────────────────────────────┘
                        │
                        ▼ (Consumer Group: `mail-dispatch-consumers`)
             [ EmailKafkaConsumer ]
                        │
       ┌────────────────┴────────────────────────┐
       ▼                                         ▼
[ Atomic Idempotency Check ]           [ Thymeleaf Template Engine ]
(processed_kafka_events DB)           (emails/payments/receipt.html, vb.)
       │                                         │
       └────────────────┬────────────────────────┘
                        │
                        ▼
                [ EmailSender ]
                        │
       ┌────────────────┴────────────────────────┐
       ▼                                         ▼
[ emails tablosu (SENT) ]               [ Kafka retry / DLT ]
(uygulama içi gelen kutusu)   (hata durumunda)
```

SMTP gönderimi yoktur: e-postalar yalnızca kullanıcının uygulama içi gelen kutusuna yazılır (`GET /api/v1/emails/my-emails`; ayrıca `/my-emails/{email-type}`, `PATCH /{id}/read`, `GET /unread-count`, `DELETE /{email-id}`, `DELETE /`). `emails` kayıtları [`EmailPurgeScheduler`](../src/main/java/com/serhat/secondhand/email/application/scheduler/EmailPurgeScheduler.java) ile her gün 02:00'de 30 günden eskiyse silinir.

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

### B. Producer (`EmailKafkaProducer.java`)
* `mail.dispatch.v1` konusuna olayları asenkron yazar (`KafkaConfig.MAIL_DISPATCH_TOPIC`; partition sayısı `app.kafka.topics.mail-dispatch-partitions`, varsayılan 3).
* Partition key `recipientEmail`'dir (null ise `eventId`); aynı alıcının mailleri aynı partition'da sıralı işlenir.
* `EmailEventPublisher.publish` olayı oluştururken her çağrıda yeni `eventId` (`UUID.randomUUID()`) üretir ve `templateVariables`'ı event data'sından `ObjectMapper.convertValue` ile çıkarır; `userName` yoksa alıcı adı eklenir. `recipient` null ise olay loglanıp atlanır.

### C. Atomik Consumer (`EmailKafkaConsumer.java`)
* `@Transactional` bir `@KafkaListener`'dır (group: `app.kafka.consumer.mail-group`, varsayılan `mail-dispatch-consumers`).
* `processed_kafka_events` tablosunda `mail:dispatch:{eventId}` anahtarı ile `insertIfNotExists` (atomik insert-on-conflict) idempotency denetimi yapar; kayıt zaten varsa olay atlanır.
* İçerik önceliği: `customHtmlBody` → `templatePath` (`EmailTemplateService` `emails/` + `templatePath` olarak Thymeleaf render eder) → `<p>{subject}</p>`.
* `recipientUserId` ile kullanıcıyı bulur (bulunamazsa `user = null` ile devam eder) ve `PENDING` bir `Email` oluşturup `EmailSender.sendEmail`'e verir.
* `EmailSender`, `REQUIRES_NEW` transaction'da kaydı `SENT` yapıp `emails` tablosuna yazar ve `EmailMetrics` günceller. Hata durumunda exception yeniden fırlatılır.

### D. Retry ve DLT (`KafkaConfig`)
* `DefaultErrorHandler` + `FixedBackOff(1000ms, 2 retry)`: toplam 3 deneme, aralarında 1 sn.
* Tükenince `DeadLetterPublishingRecoverer` olayı `mail.dispatch.v1.DLT` topic'ine (1 partition) yazar. DLT'yi okuyan bir consumer yoktur; yeniden işleme manuel yapılmalıdır.
* Consumer exception fırlatınca dış transaction rollback olur, dolayısıyla `processed_kafka_events` kaydı da geri alınır ve retry olayı yeniden işleyebilir.
* Deserialization hataları `ErrorHandlingDeserializer` ile yakalanır.

### E. Bilinen Sınırlar
* Producer outbox kullanmaz: `sendMailDispatch` future'ındaki hata yalnızca loglanır, `publish` çağıranına exception yansımaz. Broker'a yazılamayan mail kaybolur.
* `eventId` her publish'te rastgele üretildiği için idempotency yalnızca aynı Kafka mesajının tekrar teslimini önler; domain tarafında iki kez `publish` çağrılırsa iki mail oluşur.

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

`PaymentSuccessEmailEvent` `EmailType.PAYMENT_RECEIPT` / `EmailPriority.HIGH` ile `payments/receipt.html` şablonunu (`src/main/resources/templates/emails/payments/receipt.html`) seçer. Örnek akış: `PaymentNotificationService.sendPaymentSuccessNotification`.

### Yeni E-Posta Tipi Ekleme
1. `EmailType` enum'una değer ekle.
2. `application/event/impl/` altında `EmailEvent<T>` alt sınıfı yaz (`getTemplatePath()` döndürür).
3. `src/main/resources/templates/emails/<grup>/<ad>.html` şablonunu ekle.
4. Domain servisinden `EmailEventPublisher.publish(...)` çağır.

---

## 5. Güvenilirlik ve İdempotency Matrisi

| Senaryo | Eski Davranış | Yeni Davranış |
| :--- | :--- | :--- |
| **Sunucu Yeniden Başlaması (Crash)** | Bellekteki mailler kaybolurdu. | Olay broker'a yazılmışsa Kafka'da saklanır, consumer kaldığı offset'ten devam eder. |
| **Aynı Olayın Tekrar Gelmesi** | Kullanıcıya mükerrer mail giderdi. | `processed_kafka_events` tablosu mükerrer ID'yi tespit edip atlar (`dedupeKey`). |
| **Domain Katmanı Bağımlılığı** | Domain servisleri HTML tag'leri içerirdi. | Domain sadece veri DTO'su üretir; şablon yönetimi tamamen `email` modülündedir. |
| **İşleme Hatası** | Retry JVM içindeydi. | 3 deneme, sonra `mail.dispatch.v1.DLT`. |
