# Payment Modülü

Ödeme işlemlerinin tamamını yöneten modül. Kredi kartı, banka ve e-cüzdan stratejilerini destekler; escrow tabanlı para akışını orkestre eder; idempotency ve optimistic-lock güvenliğini sağlar.

---

## Paket Yapısı

```
payment/
├── api/                    → REST controller'lar
├── application/            → Uygulama servisleri ve event listener'lar
│   └── handlers/           → PaymentCompletedEvent handler'ları
├── bank/                   → Banka ödeme stratejisi
├── creditcard/             → Kredi kartı ödeme stratejisi
├── dto/                    → Request / Response DTO'ları
├── entity/                 → JPA entity'leri ve enum'lar
│   └── events/             → Domain event'leri
├── helper/                 → Stateless yardımcı sınıflar
├── mapper/                 → Entity ↔ DTO dönüşümleri
├── orchestrator/           → Escrow iş akışı executor'ları
├── repository/             → Spring Data repository'leri
├── strategy/               → Ödeme stratejisi arayüzü ve factory
├── util/                   → Sabitler, hata kodları, yardımcı servisler
└── validator/              → Ödeme doğrulama kuralları
```

---

## Akış Özeti

```
API → PaymentProcessor → PaymentPreCheckService (doğrulama)
                       → PaymentStrategyFactory → [CreditCard | Bank | EWallet]
                       → PaymentRepository.save()
                       → ApplicationEventPublisher.publishEvent(PaymentCompletedEvent)
                                ↓ (AFTER_COMMIT, async)
                       PaymentCompletedEventListener
                                ↓
                       PaymentCompletedHandlerRegistry
                         ├── @Order(1) ListingCreationPaymentCompletedHandler
                         ├── @Order(2) ItemPurchasePaymentCompletedHandler
                         └── DefaultPaymentCompletedHandler (fallback)
                       PaymentNotificationService (başarı bildirimi)
```

---

## Sınıf Referansı

### `application/`

| Sınıf | Sorumluluk |
|---|---|
| `PaymentProcessor` | Tek ödeme isteğini çalıştırır. Idempotency kontrolü, optimistic-lock retry (3 deneme), strateji seçimi, `PaymentCompletedEvent` yayını. |
| `PaymentPreCheckService` | Ödeme öncesi doğrulama zinciri: kullanıcı çözümleme → anlaşma kontrolü → doğrulama kodu → istek validasyonu. |
| `PaymentCompletedEventListener` | `PaymentCompletedEvent`'i `AFTER_COMMIT` fazında yakalar. `HandlerRegistry`'yi çalıştırır, başarı bildirimini tetikler. |
| `PaymentCompletedHandlerRegistry` | `@Order` sırasına göre uygun handler'ı bulur; hiçbiri eşleşmezse `DefaultPaymentCompletedHandler`'a düşer. |
| `PaymentCompletedHandler` | Handler arayüzü: `supports(Payment)` + `handle(Payment)`. |
| `PaymentRequestFactory` | `PaymentRequest` nesnelerini üretir (sipariş, ilan ücreti, vitrin). Gruplama, fiyat toplama ve idempotency key üretimi burada. |
| `OrderPaymentService` | Sipariş için toplu ödeme akışını yönetir; sipariş durumunu günceller. |
| `ListingFeePaymentService` (listing modülü) | İlan oluşturma ücretini işler; ücret yapılandırmasını döner. |
| `PaymentVerificationService` | Ödeme doğrulama kodu üretimi ve validasyonu. Üç ayrı metod: `isVerificationRequired`, `generateAndSendVerification`, `validateCode`. |
| `PaymentNotificationService` | Ödeme başarı/doğrulama e-postası ve in-app bildirimlerini gönderir. |
| `PaymentStatsService` | Kullanıcının ödemelerini sayfalı listeler; istatistik hesaplar; listing bilgisini zenginleştirir. |
| `PaymentContextResolver` | Bir ödemenin kullanıcı perspektifinden yönünü ve türünü çıkarır (alıcı mı, satıcı mı?). |

### `application/handlers/`

| Sınıf | Sorumluluk |
|---|---|
| `ListingCreationPaymentCompletedHandler` | `@Order(1)` — `LISTING_CREATION` ödemesi tamamlandığında `ListingPaymentHandler` üzerinden ilanı yayınlar. |
| `ItemPurchasePaymentCompletedHandler` | `@Order(2)` — `ITEM_PURCHASE` ödemesi tamamlandığında ilan durumunu günceller. |
| `DefaultPaymentCompletedHandler` | Fallback — hiçbir handler eşleşmediğinde çalışır, `supports()` her zaman `false` döner. |

### `orchestrator/`

| Sınıf | Sorumluluk |
|---|---|
| `PaymentOrchestrator` | Escrow iş akışlarını koordine eder; circular dependency'yi kırar. |
| `EscrowCreateExecutor` | Sipariş kalemleri için escrow kaydı oluşturur (bulk fetch ile N+1 önlenir). |
| `EscrowReleaseExecutor` | Sipariş tamamlandığında escrow'ları satıcıya serbest bırakır. |
| `EscrowCancelAndBuyerRefundExecutor` | Sipariş iptalinde escrow'ları iptal edip alıcıya iade eder. |
| `EscrowRefundExecutor` | Teslimat sonrası iade durumunda satıcıdan kesip alıcıya geri öder. |

### `strategy/`

| Sınıf | Sorumluluk |
|---|---|
| `PaymentStrategy` | Strateji arayüzü: `canProcess`, `process`, `getPaymentType`. |
| `PaymentStrategyFactory` | `PaymentType`'a göre doğru stratejiyi döner. |
| `CreditCardPaymentStrategy` | Kredi kartı ile ödeme simülasyonu (%95 başarı oranı). |
| `BankPaymentStrategy` | Banka havalesi ile ödeme. |

### `bank/` ve `creditcard/`

| Sınıf | Sorumluluk |
|---|---|
| `BankService` | Banka hesabı CRUD işlemleri. |
| `BankValidator` | Banka ödeme kurallarını doğrular. |
| `CreditCardService` | Kredi kartı CRUD işlemleri. |
| `CreditCardValidator` | Kart geçerlilik ve limit kontrolü. |

### `util/`

| Sınıf | Sorumluluk |
|---|---|
| `PaymentProcessingConstants` | Retry sayısı, backoff süresi, para birimi, alıcı adı sabitleri. |
| `PaymentErrorCodes` | Tüm ödeme hata kodları enum'u. |
| `PaymentValidationHelper` | `toUser` çözümleme ve istek doğrulama yardımcıları. |
| `PaymentIdempotencyHelper` | Idempotency key üretimi ve enjeksiyonu. |

### `helper/`

| Sınıf | Sorumluluk |
|---|---|
| `CreditCardHelper` | Kart numarası üretimi (Luhn), CVV, son kullanma tarihi, kart maskeleme. |
| `IbanGenerator` | Test amaçlı IBAN üretimi. |

### `entity/`

| Sınıf | Sorumluluk |
|---|---|
| `Payment` | Ana ödeme entity'si. |
| `CreditCard` | Kullanıcıya ait kredi kartı kaydı. |
| `Bank` | Kullanıcıya ait banka hesabı kaydı. |
| `PaymentType` | `CREDIT_CARD`, `BANK_TRANSFER`, `EWALLET` |
| `PaymentTransactionType` | `ITEM_PURCHASE`, `ITEM_SALE`, `LISTING_CREATION`, `SHOWCASE_PAYMENT`, `REFUND`, `EWALLET_*` |
| `PaymentDirection` | `INCOMING`, `OUTGOING` |
| `PaymentCompletedEvent` | Ödeme başarıyla tamamlandığında yayınlanan domain event. |

### `mapper/`

| Sınıf | Sorumluluk |
|---|---|
| `PaymentMapper` | `Payment` ↔ `PaymentDto` dönüşümü; `PaymentRequest`'ten entity üretimi. |
| `CreditCardMapper` | `CreditCard` ↔ `CreditCardDto` dönüşümü. |
| `BankMapper` | `Bank` ↔ `BankDto` dönüşümü. |

### `api/`

| Controller | Endpoint Grubu |
|---|---|
| `PaymentController` | Ödeme başlatma, listeleme, istatistik, doğrulama kodu tetikleme. |
| `CreditCardController` | Kredi kartı ekleme, listeleme, silme. |
| `BankController` | Banka hesabı ekleme, listeleme, silme. |

---

## Önemli Tasarım Kararları

- **Idempotency**: Aynı `idempotencyKey` + `fromUserId` çifti için tekrar ödeme işlenmez; mevcut kayıt döner.
- **Optimistic Lock Retry**: `OptimisticLockException` durumunda exponential backoff ile 3 kez denenir.
- **Escrow**: Alıcı ödemesi checkout'ta kesilir; satıcıya ödeme sipariş tamamlanana kadar escrow'da bekler.
- **Event-Driven Post-Processing**: Ödeme kaydedildikten sonra `AFTER_COMMIT` fazında async olarak listing/bildirim işlemleri tetiklenir — ana transaction etkilenmez.
- **Verification**: Kod yoksa otomatik üretilip gönderilir ve `PAYMENT_VERIFICATION_REQUIRED` hatası döner; bir sonraki istekte kod doğrulanır.


Ödeme Mantığı — Baştan Sona
1. Giriş Noktaları (3 farklı use case)
Sistemde üç farklı ödeme senaryosu var ama hepsi aynı altyapıyı kullanıyor:

a) Sipariş ödemesi (checkout) Kullanıcı sepetini onayladığında CheckoutOrchestrator devreye girer. Sepetteki ürünler satıcıya göre gruplanır — 3 farklı satıcıdan ürün aldıysan 3 ayrı ödeme isteği oluşur. Her biri OrderPaymentService üzerinden PaymentProcessor'a iletilir.

b) İlan oluşturma ücreti Kullanıcı ilan yayınlamak için ücret öder. ListingFeePaymentService (listing domain'inde) domain validasyonunu yapar, ücreti hesaplar, PaymentProcessor'a iletir.

c) Vitrin (showcase) ödemesi ShowcaseService günlük maliyeti hesaplar, PaymentProcessor'a iletir.

2. PaymentProcessor — Merkezi Yürütücü
Her üç senaryo da buraya gelir. İki kritik mekanizma var:

Idempotency kontrolü: Her istek bir idempotencyKey taşır. Aynı key + aynı kullanıcı kombinasyonu daha önce işlendiyse, yeni ödeme yapılmaz — mevcut kayıt döner. Ağ hatası veya çift tıklama gibi durumlarda para iki kez çekilmez.

Optimistic lock retry: Eş zamanlı isteklerde OptimisticLockException fırlarsa, exponential backoff ile 3 kez yeniden denenir. Başarısız olursa CONCURRENT_UPDATE hatası döner.

3. PaymentPreCheckService — Doğrulama Zinciri
Ödeme yürütülmeden önce şu kontroller sırayla yapılır:

Kullanıcı var mı?
Ödeme anlaşmaları kabul edilmiş mi?
Doğrulama kodu gerekli mi?
Kod yoksa → otomatik üretilip SMS/mail gönderilir, PAYMENT_VERIFICATION_REQUIRED hatası döner
Kod varsa → doğrulanır
Ödeme isteği geçerli mi? (tutar, yön, tip)
4. Strateji Seçimi — PaymentStrategyFactory
Doğrulama geçilince PaymentType'a göre strateji seçilir:

CREDIT_CARD → CreditCardPaymentStrategy — %95 başarı oranıyla simüle eder, kart limitini kontrol eder
BANK_TRANSFER → BankPaymentStrategy — banka bakiyesini kontrol eder
EWALLET → e-cüzdan bakiyesini kullanır
Strateji canProcess() ile önce uygunluğu kontrol eder, sonra process() ile işlemi gerçekleştirir.

5. Kayıt ve Event Yayını
Strateji sonucu ne olursa olsun (başarılı veya başarısız) Payment entity'si veritabanına kaydedilir. Başarılıysa PaymentCompletedEvent yayınlanır.

6. PaymentCompletedEvent — Asenkron Post-Processing
Event AFTER_COMMIT fazında yakalanır — yani ana transaction commit olduktan sonra, ayrı bir transaction'da çalışır. Bu kritik: ödeme kaydı kesinleşmeden yan etkiler tetiklenmez.

PaymentCompletedEventListener iki şey yapar:

a) Handler Registry: @Order sırasına göre uygun handler bulunur:

@Order(1) ListingCreationPaymentCompletedHandler → ilan ücretiyse ilanı yayınlar, listingFeePaid = true yapar
@Order(2) ItemPurchasePaymentCompletedHandler → satın alımsa listing durumunu günceller
Hiçbiri eşleşmezse DefaultPaymentCompletedHandler devreye girer (no-op)
b) Bildirim: PaymentNotificationService üzerinden kullanıcıya başarı e-postası ve in-app bildirimi gönderilir.

7. Escrow Mekanizması (sipariş ödemesine özel)
Sipariş ödemesi başarılıysa CheckoutOrchestrator hemen ardından escrow oluşturur:

Alıcının parası checkout'ta çekilir
Her sipariş kalemi için ayrı bir OrderItemEscrow kaydı oluşturulur, durum PENDING
Para satıcıya hemen gitmez — escrow'da bekler
Sipariş tamamlandığında → EscrowReleaseExecutor satıcı cüzdanına aktarır
Sipariş iptal edildiğinde → EscrowCancelAndBuyerRefundExecutor alıcıya iade eder
İade talebinde → EscrowRefundExecutor satıcıdan kesip alıcıya geri öder
Özet Akış

İstek gelir
  → PaymentProcessor (idempotency kontrolü)
  → PaymentPreCheckService (kullanıcı + anlaşma + doğrulama kodu)
  → PaymentStrategyFactory (CREDIT_CARD / BANK / EWALLET)
  → Payment kaydedilir
  → PaymentCompletedEvent yayınlanır
       ↓ (AFTER_COMMIT, async)
  → HandlerRegistry (listing yayınla / durum güncelle)
  → Bildirim gönder
  → [Sipariş için] Escrow oluştur → tamamlanınca satıcıya serbest bırak