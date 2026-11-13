# Checkout Pipeline ve Dağıtık Transaction Mimarisi

Bu doküman, pazaryerinin en yüksek riskli para ve stok hattı olan **Checkout (Satın Alma)** operasyonunun uçtan uca mimarisini, çoklu satıcıya sipariş bölme (*order splitting*) mantığını, Redis Lua atomik stok rezervasyonunu, Transactional Outbox entegrasyonunu ve hata durumundaki compensation (*compensation/rollback*) mekanizmalarını açıklar. Kod referansları: [`CheckoutOrchestrator`](../src/main/java/com/serhat/secondhand/checkout/application/CheckoutOrchestrator.java), [`CheckoutStockReservationService`](../src/main/java/com/serhat/secondhand/checkout/application/CheckoutStockReservationService.java), [`OrderCreationService`](../src/main/java/com/serhat/secondhand/order/application/OrderCreationService.java), [`OrderPaymentService`](../src/main/java/com/serhat/secondhand/payment/application/OrderPaymentService.java).

İlgili dokümanlar: Ödeme stratejisi [payment-strategy-and-provider-extension-guide.md](payment-strategy-and-provider-extension-guide.md), fiyatlandırma ve kuponlar [pricing-coupon-and-campaign-architecture.md](pricing-coupon-and-campaign-architecture.md), escrow döngüsü [escrow-lifecycle-and-state-machine.md](escrow-lifecycle-and-state-machine.md), stok rezervasyonu ve reconciliation [stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md).

---

## 1. Uçtan Uca Checkout Akışı ve Sıralama

Alıcının sepetindeki ürünleri satın alma isteği (`POST /api/v1/orders/checkout`) tek bir Spring `@Transactional` sınırı içerisinde koordine edilir:

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Alıcı (Client)
    participant CO as CheckoutOrchestrator
    participant CPF as CheckoutPricingContextFactory
    participant CSR as CheckoutStockReservationService (Redis)
    participant OCS as OrderCreationService (DB)
    participant OPS as OrderPaymentService
    participant ES as EscrowService (DB & Outbox)
    participant CS as CouponService
    participant TX as TransactionSynchronization

    Buyer->>CO: POST /api/v1/orders/checkout (CheckoutRequest)
    Note over CO: @Transactional başlangıcı

    CO->>CPF: build(userId, request)
    Note over CPF: Sepet + Kabul edilen teklif + Fiyatlandırma (priceCartForCheckout)
    CPF-->>CO: PricingContext (Kupon/kampanya düşülmüş fiyat)

    CO->>CSR: reserveStock(userId, effectiveCartItems)
    Note over CSR: Redis Lua: reserve_stock_with_ttl.lua (15 dk TTL)
    CSR-->>CO: Map<UUID, Integer> reserved

    CO->>OCS: createOrders(user, cartItems, request, pricing)
    Note over OCS: Sepeti satıcı bazında grupla → N adet Order ve OrderItem kaydet
    OCS-->>CO: List<Order> (Statü: PENDING)

    loop Her Satıcı Siparişi İçin
        CO->>OPS: processPaymentsForOrder(order, ...)
        Note over OPS: Provider: EWALLET (tek adapter: EWalletPaymentProviderAdapter)
        OPS-->>CO: PaymentDto (COMPLETED)
        CO->>ES: hold(order)
        Note over ES: escrows tablosuna ESCROW statüsünde kayıt aç
    end

    CO->>CS: redeem(couponCode, userId, couponOrder)
    CO->>CO: offerService.markCompleted(acceptedOffer)
    CO->>CO: cartRepository.deleteByUserId(userId)

    CO->>TX: afterCommit kaydı (consumeReservationsOnSuccess)
    CO->>TX: afterCompletion(ROLLED_BACK) kaydı (releaseReservedStockOnRollback)
    CO->>CO: OrderCreatedEvent yayınla (sipariş başına)

    Note over CO: Transaction Commit (DB Yazımları Kesinleşir)
    TX-->>CSR: consumeReservationOnPurchase (pending key yaz, reservation key sil)
    CO->>Buyer: 200 OK (CheckoutResultDto: Order listesi & toplam tutar)
```

---

## 2. Adım Adım İşlem Detayları

### 2.1. Fiyat ve Teklif Bağlamının Hazırlanması (`CheckoutPricingContextFactory`)
- Alıcının aktif sepeti veritabanından getirilir (`cartRepository.findByUserIdWithListing(userId)`).
- Eğer istekte `offerId` varsa, satıcı tarafından kabul edilmiş aktif teklif doğrulanır (`IOfferService.getAcceptedOfferForCheckout`). Teklifteki ürün ve indirimli fiyat sepet satırının yerine geçer.
- Fiyat motoru çalıştırılır: `IPricingService.priceCartForCheckout`.
  > [!IMPORTANT]
  > Sepet önizlemesinde (`priceCart`) geçersiz veya kotası dolmuş kuponlar sessizce düşülerek kalan tutar gösterilebilir; ancak checkout anında **asla sessiz kupon düşümü yapılamaz**. Kupon geçersizse `priceCartForCheckout` doğrudan ilgili hata koduyla (`COUPON_EXPIRED`, `COUPON_USAGE_LIMIT_REACHED` vb.) checkout işlemini durdurur.

### 2.2. Kilitsiz Stok Rezervasyonu (`CheckoutStockReservationService`)
- Her ilanın `ListingStatus.ACTIVE` olduğu teyit edilir.
- PostgreSQL seviyesinde `PESSIMISTIC_WRITE` (satır kilidi) alınmaz; bunun yerine Redis üzerinde çalışan atomik `reserve_stock_with_ttl.lua` script'i çağrılır.
- **15 Dakikalık Anti-Hoarding TTL:** Rezerve edilen adetler `v4:inventory:reservation:{userId}:{listingId}` anahtarında `app.checkout.reservation-ttl-seconds` (varsayılan 900 sn) TTL ile tutulur.
- Eğer sepetteki herhangi bir kalemde yetersiz stok çıkarsa (veya ilan `ACTIVE` değilse: `INVALID_LISTING_STATUS`), o ana kadar ayrılmış tüm rezervasyonlar `cancel_user_reservation.lua` ile anında serbest bırakılır ve işlem iptal edilir. Beklenmeyen Redis hatası `STOCK_RESERVATION_ERROR` döner.
- **Teklifli checkout:** Kabul edilen teklifin adedi kabul anından beri aynı rezervasyon key'inde ödeme süresi TTL'i ile tutulur (`OfferStockHoldService`); script yalnızca farkı aldığı için ek stok düşmez. `CheckoutOrchestrator` teklif ilanını bırakılacak rezervasyon listesinden çıkarır, böylece başarısız checkout teklifin stok tutmasını silmez.

### 2.3. Çoklu Satıcı Sipariş Bölme (*Multi-Seller Order Splitting*)
Pazaryerinde bir alıcı, tek bir sepette birden fazla farklı satıcının ürününü aynı anda satın alabilir. `OrderCreationService` bu durumu şu kurallarla yönetir:
1. **Satıcı Gruplaması:** Sepetteki kalemler satıcı ID'sine göre `Map<Long, List<Cart>>` (`LinkedHashMap`, sepet sırası korunur) şeklinde gruplanır.
2. **Bağımsız Sipariş Kayıtları:** Her satıcı için ayrı bir `Order` nesnesi, tekil sipariş numarası (`ORDER_NUMBER_PREFIX` + epoch milisaniye + `-` + 8 haneli UUID parçası, örn. `ORD-1731400000000-1A2B3C4D`), teslimat yöntemi (`CARGO` varsayılan veya `SAFE_MEETUP`; `SAFE_MEETUP` için shipping kaydı açılmaz) ve teslimat adresi ile üretilir.
3. **Orantılı İndirim Dağıtımı:** Sepete uygulanan genel sepet kuponu veya satıcı kampanyaları, sipariş kalemlerinin alt toplamlarına orantılı olarak (`BigDecimal` yuvarlama kurallarına uygun biçimde) sipariş satırlarına paylaştırılır.
4. **Tek Transaction Garantisi:** Sepetteki 3 satıcının siparişi de aynı `@Transactional` metot içinde oluşturulur. Biri bile veritabanına yazılamazsa hiçbiri kaydedilmez.

### 2.4. Ödeme Yürütme ve Escrow Blokesi
- Her bir sipariş için `OrderPaymentService.processPaymentsForOrder` çalıştırılır.
- Varsayılan ve birincil ödeme yöntemi `EWALLET`'tır. Alıcının bakiyesi kontrol edilir, harcama limitleri denetlenir ve tutar bloke edilerek çekilir.
- Ödeme başarılı olduğunda:
  - Siparişin `paymentStatus` değeri `PaymentStatus.COMPLETED` yapılır.
  - Sipariş statüsü teslimat modeline göre `OrderStatus.CONFIRMED` veya `OrderStatus.MEETUP_PENDING` olarak güncellenir.
  - `EscrowService.hold(order)` çağrılarak her bir sipariş kalemi için `escrows` tablosunda `PaymentStatus.ESCROW` statüsünde bloke kaydı açılır. Para hiçbir koşulda doğrudan satıcıya aktarılmaz.

### 2.5. Post-Payment Finalizasyonu ve Sepet Temizliği
- **Kupon Redemption:** Eğer kupon kullanılmışsa, `couponService.redeem()` çağrılır ve indirimden faydalanan ilk sipariş ile kupon kullanımı mühürlenir (`coupon_redemptions` tablosu).
- **Teklif Kapatma:** Eğer işlem bir pazarlık teklifine dayanıyorsa, `offerService.markCompleted()` teklifi koşullu `UPDATE` ile (`ACCEPTED` + version kontrolü) `OfferStatus.COMPLETED` yapar; eşzamanlı ikinci checkout `OFFER_CONCURRENT_MODIFICATION` alır. Teklifin stok tutması başarıda diğer rezervasyonlar gibi pending'e çevrilir (bkz. [offer-system-and-concurrency-locks.md](offer-system-and-concurrency-locks.md) §6).
- **Finalizasyon hatası:** Kupon redemption veya teklif kapatma başarısız olursa ödemeler ve siparişler de geri alınır (`rollbackCheckout` + `releaseReservedStock`).
- **Sepet Sıfırlama:** `cartRepository.deleteByUserId(userId)` ile alıcının sepeti temizlenir.

---

## 3. Dağıtık Transaction Güvenliği ve Rollback Protokolü

Checkout işlemi dağıtık kaynakları (PostgreSQL, Redis in-memory rezervasyonları, harici payment provider'ları ve Kafka) aynı anda yönettiği için çift yönlü compensation (*two-way compensation*) mimarisi uygulanır:

```mermaid
flowchart TD
    subgraph ExecutionPhase ["Çalışma Aşaması (@Transactional)"]
        A["Ödeme veya Escrow Hatası Oluştu"] --> B["rollbackCheckout()<br/>setRollbackOnly() çağrısı"]
        B --> C["checkoutStockReservationService<br/>.releaseReservedStock(userId, reserved)"]
        C --> D["Redis: cancel_user_reservation.lua<br/>Stok anında havuza iade edilir"]
    end

    subgraph CommitPhase ["Commit Sırası (PostgreSQL)"]
        E["DB Commit Hatası (OptimisticLock vb.)"] --> F["TransactionSynchronization<br/>.afterCompletion(STATUS_ROLLED_BACK)"]
        F --> G["releaseReservedStockOnRollback()<br/>Redis stok kilidi serbest kalır"]
    end

    subgraph SuccessPhase ["Başarılı Commit Sonrası (afterCommit)"]
        H["DB Commit Başarılı"] --> I["consumeReservationsOnSuccess()<br/>reservation key -> pending key"]
        H --> J["PaymentOutboxWorker: payment.completed.v1 yayınlanır"]
        J --> K["InventoryKafkaConsumer<br/>PostgreSQL listings.stock atomik düşürülür"]
    end
```

### 3.1. Anında İade ve Geri Alma (*Immediate Rollback & Compensation*)
Sipariş oluşturma, ödeme (`paymentResult.isError()` veya herhangi bir `PaymentDto` başarısız) ya da finalizasyon adımı hata verirse:
1. `rollbackCheckout()` -> `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`: hata `Result` olarak dönerken commit sessiz rollback'e döner (aksi halde Spring unexpected-rollback hatası -> 500).
2. `releaseReservedStock` çalıştırılarak `cancel_user_reservation.lua` üzerinden Redis'te tutulan ürünler **15 dakikalık sürenin dolması beklenmeden** diğer alıcılara açılır.
3. Alıcıya hata kodu dönülür (ödeme sonucu başarısızsa `PAYMENT_FAILED`, aksi halde alt adımın kodu).
4. `escrowService.hold` hatası `IllegalStateException` fırlatır; `catch` bloğu stoku serbest bırakır ve exception transaction'ı geri alır.

### 3.2. Commit Esnasındaki Çökmeler (*Fail-Safe Synchronization*)
Eğer tüm adımlar başarılı geçmesine rağmen PostgreSQL `commit` anında bağlantı koparsa veya veritabanı kilitlenirse:
- Spring `TransactionSynchronization` arayüzü ile kayıtlı olan `releaseReservedStockOnRollback` kancası devreye girer ve Redis rezervasyonunu serbest bırakır.

### 3.3. Asenkron Stok Düşümü ve Auto-Healing
1. Ödeme kaydıyla aynı transaction içinde `payment_outbox_events` satırı yazılır; commit sonrası `PaymentOutboxWorker` bu satırı `payment.completed.v1` olarak Kafka'ya gönderir. Aynı anda `afterCommit` kancası rezervasyonu `v4:inventory:pending:{orderItemId}:{listingId}` işaretine çevirir (Redis stoku değişmez).
2. `InventoryKafkaConsumer`, `processed_kafka_events` tablosunda idempotency kontrolü yaparak PostgreSQL'deki `listings` tablosunun kalıcı `stock` kolonunu düşürür.
3. Eğer Kafka veya veritabanı tüketicisinde bir gecikme olursa, arka planda çalışan `StockReservationReconciliationScheduler` Redis ve PostgreSQL arasındaki farkları tespit ederek otomatik mutabakat sağlar (*auto-healing*).

---

## 4. Kullanılan Redis Anahtarları ve Lua Scriptleri

| Redis Anahtarı | Tip | TTL | Görevi |
| :--- | :--- | :--- | :--- |
| `v4:inventory:reservation:{userId}:{listingId}` | String (Integer) | 900 sn (15 dk); teklif tutmasında ödeme süresi | Kullanıcının checkout'ta ya da kabul edilen teklif için tuttuğu rezerve adedi gösterir. |
| `v4:inventory:stock:{listingId}` | String (Integer) | Kalıcı / Cache | İlanın anlık satılabilir Redis stok bakiyesidir. |
| `v4:inventory:pending:{orderItemId}:{listingId}` | String (Integer) | 86400 sn (24 saat) | DB mutabakatı öncesi kesinleşen satın alımları tutar (`InventoryRedisReservationService`). |

### Lua Script Görevleri:
- `reserve_stock_with_ttl.lua`: `available_stock >= qty` kontrolünü atomik yapar, stoku düşer ve 15 dk TTL ile rezervasyon anahtarını oluşturur.
- `cancel_user_reservation.lua`: Rezervasyon anahtarını siler ve rezerve edilen miktarı `available_stock` üzerine atomik olarak iade eder.
- Lua yok: commit sonrası `consumeReservationOnPurchase` iki düz Redis komutu çalıştırır (önce pending key `SET`, sonra reservation key `DELETE`), böylece reconciliation job ikisini birden göremez duruma düşmez.

---

## 5. Güvenlik ve Doğrulama Kuralları

1. **Idempotency:** Checkout'ta her siparişin `externalId` değeri ödeme idempotency key'i olarak `PaymentProcessor`'a geçer (`v4:payment:idempotency:{key}`, `SET NX`). `Idempotency-Key` header'ı yalnızca eWallet endpoint'lerinde kullanılır.
2. **Pre-check:** `PaymentPreCheckService` kullanıcıyı, kabul edilmiş agreement'ları ve gerekiyorsa OTP doğrulamasını (`PAYMENT_VERIFICATION_REQUIRED`) kontrol eder. Moderasyon yaptırımı (sanction) kontrolü yoktur; bkz. [proposals](proposals/aura-trust-safety-and-complaint-moderation.md).
3. **IDOR Koruması:** `OrderCreationService` teslimat ve fatura adresinin alıcıya ait olduğunu doğrular; endpoint `@PreAuthorize("isAuthenticated()")`.
