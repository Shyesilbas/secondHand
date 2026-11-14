# Redis ve Kafka Mimari Raporu (Architecture & Implementation Guide)

Bu doküman, **secondHand** projesindeki **Redis (In-Memory Cache & Concurrency Control)** ve **Apache Kafka (Event-Driven Architecture & Transactional Outbox)** altyapısının uçtan uca mimarisini, tasarım kararlarını, veri akışlarını ve uygulama detaylarını içermektedir.

---

## 1. Genel Mimari Bakış ve Sistem Akışı

Sistemimizde veri tutarlılığı (consistency), yüksek eşzamanlılık (high concurrency), sıfır çift çekim (zero double-charge) ve sıfır stok aşımı (zero over-selling) ilkeleri doğrultusunda **hibrit bir mimari** kurgulanmıştır.

```
[Client / HTTP Request]
         │
         ▼
[Controller / Application Service Layer]
         │
         ├───► [Redis (In-Memory Engine)]
         │      ├── Multi-Tier Cache (v4: Prefix, Polymorphic JSON)
         │      ├── Atomik Lua Stok Rezervasyonu (15 dk TTL, Anti-Hoarding)
         │      ├── Payment Idempotency Lock (SET NX, 1 saat / 24 saat)
         │      ├── Atomik Kupon Kullanım Limiter
         │      └── Rate limit, login throttling, access token revocation
         │
         └───► [PostgreSQL (ACID Primary Database)]
                ├── Business Entity Kayıtları
                ├── Transactional Outbox Tabloları (*_outbox_events)
                └── Consumer Idempotency Tablosu (processed_kafka_events)
                         │
                         ▼ (Periyodik Worker / Scheduled Polling)
               [Outbox Workers (Payment / Order / Escrow)]      [EmailKafkaProducer (outbox yok)]
                         │                                              │
                         ▼ (At-Least-Once Delivery)                     │
               [Apache Kafka Broker (Topics)] ◄─────────────────────────┘
               ├── payment.completed.v1   → Inventory + PaymentCompleted consumer
               ├── escrow.released.v1     → Escrow consumer
               ├── mail.dispatch.v1       → Email consumer
               └── order.cancelled.v1 / order.refunded.v1   → consumer yok (dış consumer'lar için)
                         │
        ┌────────────────┼─────────────────────┬──────────────────────┐
        ▼                ▼                     ▼                      ▼
[InventoryKafkaConsumer] [PaymentCompletedKafkaConsumer] [EscrowKafkaConsumer] [EmailKafkaConsumer]
 ├── Idempotency Check    ├── Idempotency Check           ├── Idempotency Check  ├── Idempotency Check
 ├── DB Stok Düşümü       ├── PaymentCompletedHandler'lar └── eWallet kredi       └── emails tablosu
 └── Otomatik 'SOLD'      └── Ödeme bildirimi                 aktarımı               (uygulama içi kutu)
```

`payment.failed.v1` ve `payment.refunded.v1` için `KafkaConfig` içinde yalnızca `NewTopic` bean'i vardır; bu topic'lere publish eden ya da onları dinleyen kod yoktur.

---

## 2.  Redis Mimarisi ve Kullanım Alanları

Redis projemizde iki ana amaçla kullanılır:
1. **Multi-Tiered Cache (Çok Katmanlı Cache)**: Okuma performansını maksimize etmek ve DB yükünü azaltmak.
2. **Atomik Eşzamanlılık & Dağıtık Kilit (Concurrency & Rate Limiting)**: Race condition'ları ve tutarsızlıkları sub-millisecond seviyesinde engellemek.

### A. Çok Katmanlı Cache Mimarisi ([CacheConfig.java](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java))

* **Cache Key Versioning:** Tüm cache anahtarları `v4:<cacheName>:<key>` biçiminde saklanır (`CACHE_VERSION + ":" + cacheName + ":"`). Serializer veya DTO format değişikliklerinde `CACHE_VERSION` artırılarak eski kayıtlarla çakışma (corrupted cache) önlenir; eski kayıtlar TTL bitiminde Redis tarafından temizlenir.
* **Polymorphic Jackson Serializer:** `GenericJackson2JsonRedisSerializer` üzerinde `DefaultTyping.EVERYTHING` ve `JsonTypeInfo.As.PROPERTY` kullanılarak `@class` tipi korunur. Bu sayede `CachedPage` (record), `PageImpl`, `UUID`, enum ve domain DTO'ları hem yazarken hem okurken tip kaybı olmadan deserialize edilir.
* **Tiered TTL:** Cache isimleri, TTL'leri ve hangi servisin kullandığı tek yerde tutulur: [multi-tier-redis-caching-and-invalidation.md](multi-tier-redis-caching-and-invalidation.md).

---

### B. Modül Bazlı Redis Key, Lua ve Kilit Kayıt Defteri (Registry)

İkinci el e-ticarette yüksek eşzamanlılık gerektiren stok rezervasyonu, ödeme idempotency kilidi, kupon kotaları ve rate limiting işlemleri, veritabanı satır kilitleri (`SELECT ... FOR UPDATE`) yerine **Redis ve atomik Lua script'leri** (`src/main/resources/scripts/`) ile yönetilir. Her modül kendi Redis key ve TTL kurallarının tek sahibidir (One Home per Fact):

| Alan / Key Prefix | Sahip Sınıf & Lua Script | Detaylı Kurallar (Modül Hub & Deep Dive) |
| :--- | :--- | :--- |
| `v4:inventory:stock:{listingId}`<br/>`v4:inventory:reservation:{userId}:{listingId}`<br/>`v4:inventory:pending:{orderItemId}:{listingId}` | `InventoryRedisReservationService`<br/>`StockReservationReconciliationScheduler`<br/>(`reserve_stock_with_ttl.lua`, `cancel_user_reservation.lua`, `release_stock.lua`, `compare_and_set_stock.lua`, `reserve_stock.lua`) | [`inventory/README.md`](../src/main/java/com/serhat/secondhand/inventory/README.md) · [`stock-reservation-and-reconciliation.md`](stock-reservation-and-reconciliation.md) |
| `v4:payment:idempotency:{key}` | `PaymentRedisIdempotencyService` (`PaymentProcessingConstants`) | [`payment/README.md`](../src/main/java/com/serhat/secondhand/payment/README.md) · [`payment-strategy-and-provider-extension-guide.md`](payment-strategy-and-provider-extension-guide.md) |
| `v4:coupon:usage:global:{CODE}`<br/>`v4:coupon:usage:user:{CODE}:{userId}` | `CouponRedisLimiterService`<br/>(`apply_coupon_with_limit.lua`, `release_coupon_usage.lua`) | [`coupon/README.md`](../src/main/java/com/serhat/secondhand/coupon/README.md) · [`pricing-coupon-and-campaign-architecture.md`](pricing-coupon-and-campaign-architecture.md) |
| `v4:listing:showcase:active:{listingId}` | `ShowcaseRedisManagerService` | [`showcase/README.md`](../src/main/java/com/serhat/secondhand/showcase/README.md) · [`social-proof-and-urgency-metrics-architecture.md`](social-proof-and-urgency-metrics-architecture.md) |
| `v4:listing:active_viewers:{listingId}`<br/>`v4:listing:view:dedup:{kimlik}:{listingId}` | `ListingViewService` | [`listing/README.md`](../src/main/java/com/serhat/secondhand/listing/README.md) · [`social-proof-and-urgency-metrics-architecture.md`](social-proof-and-urgency-metrics-architecture.md) |
| `v4:cart:in_cart_users:{listingId}` | `CartSocialMetricService` | [`cart/README.md`](../src/main/java/com/serhat/secondhand/cart/README.md) · [`social-proof-and-urgency-metrics-architecture.md`](social-proof-and-urgency-metrics-architecture.md) |
| `v4:user:restriction:{userId}` | `UserRestrictionService` | [`user/README.md`](../src/main/java/com/serhat/secondhand/user/README.md) · [`aura-trust-safety-and-complaint-moderation.md`](proposals/aura-trust-safety-and-complaint-moderation.md) |
| `v4:complaints:delayed_queue`<br/>`v4:complaints:appeal_queue`<br/>`v4:lock:complaint:worker`<br/>`v4:rate_limit:complaint:user:{userId}` | `ComplaintReviewQueue`, `ComplaintWorkerLock`, `ComplaintRateLimiter`<br/>(`release_lock.lua`, `rate_limit_window.lua`) | [`complaint/README.md`](../src/main/java/com/serhat/secondhand/complaint/README.md) · [`aura-trust-safety-and-complaint-moderation.md`](proposals/aura-trust-safety-and-complaint-moderation.md) |
| `v6:catalog:locations:*` | `LocationCatalogService` | [`listing/README.md`](../src/main/java/com/serhat/secondhand/listing/README.md) · [`multi-tier-redis-caching-and-invalidation.md`](multi-tier-redis-caching-and-invalidation.md) |
| `ratelimit:{kategori}:{ip/user}:{pencere}` | `RateLimitingFilter` (`rate_limit_window.lua`) | [`core/README.md`](../src/main/java/com/serhat/secondhand/core/README.md) · [`rate-limiting-and-throttling-architecture.md`](rate-limiting-and-throttling-architecture.md) |
| `auth:login-fail:*`, `auth:access-revoked:*`, `auth:access-token-revoked:*`, `auth:pwreset:requests:*` | `LoginAttemptService`, `AccessRevocationService`, `PasswordService` | [`auth/README.md`](../src/main/java/com/serhat/secondhand/auth/README.md) · [`auth-jwt-and-security-architecture.md`](auth-jwt-and-security-architecture.md) |

`ratelimit:` ve `auth:` key'leri `v4:` prefix'i taşımaz.

---

## 3.  Apache Kafka Mimarisi ve Event-Driven Pipeline (EDA)

Domainler arası senkron HTTP/gRPC çağrıları yerine **Event-Driven Architecture (EDA)** tercih edilmiştir. Bu sayede ödeme işlemi tamamlandığında stok düşümü, e-posta gönderimi, fatura ve satıcı cüzdan aktarımı ana transaction'ı bloke etmeden asenkron yürütülür.

### A. Transactional Outbox Pattern (Dual-Write Güvenliği)

Veritabanına kayıt yazıp hemen ardından Kafka'ya mesaj gönderildiğinde meydana gelebilecek tutarsızlıkları (*Dual-Write Problem*) önlemek için **Transactional Outbox Pattern** kullanılır:

1. Ödeme, sipariş iptali veya escrow işlemleri sırasında event **doğrudan Kafka'ya atılmaz**.
2. Event kaydı, ana entity kaydı ile **aynı ACID veritabanı transaction'ında** Outbox tablosuna (`payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`) yazılır.
3. Arka plandaki worker'lar ([PaymentOutboxWorker](../src/main/java/com/serhat/secondhand/payment/outbox/PaymentOutboxWorker.java), [OrderOutboxWorker](../src/main/java/com/serhat/secondhand/order/outbox/OrderOutboxWorker.java), [EscrowOutboxWorker](../src/main/java/com/serhat/secondhand/escrow/outbox/EscrowOutboxWorker.java)) 5 saniyede bir, zamanı gelmiş **`PENDING`** event'lerden en fazla 50 tanesini alır ve Kafka'ya gönderir.
4. Broker onayı en fazla `app.outbox.publish-timeout-seconds` (15 sn) beklenir. Başarıda durum `PROCESSED` olur; hatada `attemptCount` artar ve `nextAttemptAt` ileri atılır. `maxAttempts` (10) dolunca event `FAILED` olur ve **otomatik olarak yeniden denenmez**; `FAILED` satırlar izlenmelidir.

Durumlar (`OutboxStatus`): `PENDING` → `PROCESSING` → `PROCESSED`, ya da deneme hakkı bitince `FAILED`.

Örnek ([`PaymentOutboxWorker.processEvent`](../src/main/java/com/serhat/secondhand/payment/outbox/PaymentOutboxWorker.java), her event `REQUIRES_NEW` transaction'da ve satır kilidiyle işlenir):

```java
PaymentOutboxEvent event = paymentOutboxRepository.findByIdForUpdate(eventId).orElse(null);
if (event == null || event.getStatus() == OutboxStatus.PROCESSED) { return; }
try {
    event.setStatus(OutboxStatus.PROCESSING);
    Payment payment = paymentRepository.findById(UUID.fromString(event.getPayload())).orElseThrow();
    paymentKafkaProducer.sendPaymentCompleted(payment).get(publishTimeoutSeconds, TimeUnit.SECONDS);
    event.setStatus(OutboxStatus.PROCESSED);
    event.setProcessedAt(LocalDateTime.now());
} catch (Exception ex) {
    int newAttempt = event.getAttemptCount() + 1;
    event.setAttemptCount(newAttempt);
    event.setNextAttemptAt(LocalDateTime.now().plusSeconds(Math.min(300, newAttempt * 10L)));
    event.setStatus(newAttempt >= event.getMaxAttempts() ? OutboxStatus.FAILED : OutboxStatus.PENDING);
}
```

Üç worker'ın bekleme (backoff) hesabı aynı değildir:

| Worker | Yayınladığı topic | Sonraki deneme | Not |
| :--- | :--- | :--- | :--- |
| `PaymentOutboxWorker` | `payment.completed.v1` | `min(300, deneme × 10)` sn (doğrusal) | Payload yalnızca `paymentId`'dir; event gönderim anında `Payment` satırından üretilir. |
| `EscrowOutboxWorker` | `escrow.released.v1` | `min(300, 2^deneme × 5)` sn | Payload JSON `EscrowReleasedKafkaEvent`. |
| `OrderOutboxWorker` | `order.cancelled.v1`, `order.refunded.v1` | `2^deneme` sn (üst sınır yok) | Tüm batch tek transaction'da işlenir. |

#### 1. Neden polling, neden CDC değil?
CDC (Debezium vb.) WAL'i dinleyerek DB'ye `SELECT` atmadan çalışır ama Kafka Connect gibi ek bileşen ister. Projede Spring `@Scheduled` worker'lar yeterli görülmüştür. Polling sorgusu `status` ve `next_attempt_at` ile filtreler, `created_at`'e göre sıralar; her outbox tablosunda bu filtre için index vardır:

```sql
CREATE INDEX IF NOT EXISTS idx_payment_outbox_status_next_attempt ON payment_outbox_events (status, next_attempt_at);
-- aynı index: idx_escrow_outbox_status_next_attempt (V15), idx_order_outbox_status_next_attempt (V16)
```

#### 2. Outbox temizliği
[OutboxHousekeepingScheduler](../src/main/java/com/serhat/secondhand/core/outbox/OutboxHousekeepingScheduler.java) her gece 03:00'te (`app.outbox.cleanup.cron`) çalışır:

```java
LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);   // app.outbox.cleanup.retention-days, varsayılan 3
paymentOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
orderOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
escrowOutboxRepository.deleteByStatusAndProcessedAtBefore(OutboxStatus.PROCESSED, cutoff);
processedKafkaEventRepository.deleteByProcessedAtBefore(cutoff);
```

Yalnızca `PROCESSED` satırlar silinir; `FAILED` satırlar kalır. `processed_kafka_events` de aynı sınırla temizlendiği için 3 günden eski bir mesaj yeniden teslim edilirse tekrar işlenir. `(status, processed_at)` için ayrı bir index tanımlı değildir.

---

### B. Consumer Idempotency (Effectively-Once İşleme)

Kafka mesaj dağıtımı doğası gereği *At-Least-Once (En az bir kere)* garantisi sunar. Rebalancing, timeout veya retry senaryolarında aynı mesaj bir consumer'a tekrar gelebilir.

Her consumer işe başlamadan önce [`ProcessedKafkaEventRepository.insertIfNotExists`](../src/main/java/com/serhat/secondhand/core/idempotency/ProcessedKafkaEventRepository.java) çağırır:

```java
@Query(value = "INSERT INTO processed_kafka_events (id, consumer_group, processed_at) "
        + "VALUES (:id, :consumerGroup, NOW()) ON CONFLICT (id) DO NOTHING", nativeQuery = true)
int insertIfNotExists(@Param("id") String id, @Param("consumerGroup") String consumerGroup);
```

Dönen değer `0` ise mesaj daha önce işlenmiştir ve atlanır. Insert, consumer'ın iş transaction'ı içindedir: iş hata verirse dedupe kaydı da geri alınır ve retry mesajı yeniden işleyebilir.

| Consumer | Dedupe key | Group |
| :--- | :--- | :--- |
| `InventoryKafkaConsumer` | `inventory:payment:{paymentId}` | `inventory-sync-consumers` |
| `PaymentCompletedKafkaConsumer` | `payment:completed:{paymentId}` | `payment-completed-consumers` |
| `EscrowKafkaConsumer` | `escrow:release:{escrowId}` | `escrow-released-consumers` |
| `EmailKafkaConsumer` | `mail:dispatch:{eventId}` | `mail-dispatch-consumers` |

Aynı topic'i dinleyen iki consumer (`payment.completed.v1`) farklı key kullandığı için birbirini engellemez.

---

### C. Topic'ler ve Event Tüketim Akışları ([KafkaConfig.java](../src/main/java/com/serhat/secondhand/core/config/KafkaConfig.java))

| Topic | Partition / Replica | Producer (Outbox) | Consumer | İşlenen Görevler |
| :--- | :--- | :--- | :--- | :--- |
| `payment.completed.v1` | 3 / 1 | `PaymentOutboxWorker` | `PaymentCompletedKafkaConsumer` | `PaymentCompletedHandler`'ları çalıştırır (ilan ücreti → ilanı yayına alma vb.) ve ödeyene ödeme bildirimi gönderir. |
| `payment.completed.v1` | 3 / 1 | `PaymentOutboxWorker` | `InventoryKafkaConsumer` | Yalnızca `ITEM_PURCHASE` için PostgreSQL stoğunu düşer; stok 0 ise ilanı `SOLD` yapar, Redis pending işaretini siler. |
| `escrow.released.v1` | 3 / 1 | `EscrowOutboxWorker` | `EscrowKafkaConsumer` | Ürün alıcıya teslim edilip onaylandığında, havuzdaki paranın satıcının `eWallet` hesabına aktarılması. |
| `mail.dispatch.v1` | 3 / 1 | `EmailKafkaProducer` (outbox yok) | `EmailKafkaConsumer` | Asenkron e-posta gönderimi. Ayrıntılar: [email-architecture-and-event-driven-dispatch.md](email-architecture-and-event-driven-dispatch.md). |
| `order.cancelled.v1` | 3 / 1 | `OrderOutboxWorker` | **Yok** | Dış tüketiciler için yayınlanır. Stok iadesi bu event'e bağlı değildir; senkron yapılır ([order-lifecycle-and-compensation-management.md](order-lifecycle-and-compensation-management.md)). |
| `order.refunded.v1` | 3 / 1 | `OrderOutboxWorker` | **Yok** | Dış tüketiciler için yayınlanır; para iadesi ve stok güncellemesi senkron akıştadır. |

---

### D. Serialization ve Hata Yönetimi (Error Handling & Serialization)

* **Serializer:** `JsonSerializer` (producer) ve `ErrorHandlingDeserializer` ile sarılmış `JsonDeserializer` (consumer).
* **Deserialization Resilience:** Bozuk bir mesaj geldiğinde consumer container çökmez; hata yakalanıp loglanır ve stream akışı duraksamaz.
* **Retry, Backoff & DLT:** `ConcurrentKafkaListenerContainerFactory` üzerinde `DefaultErrorHandler(DeadLetterPublishingRecoverer, new FixedBackOff(1000L, 2L))` tanımlıdır: 1 saniye aralıkla 2 retry (toplam 3 deneme), ardından mesaj `<topic>.DLT` topic'ine yazılır. DLT'ler `payment.completed.v1.DLT`, `escrow.released.v1.DLT` ve `mail.dispatch.v1.DLT`'dir (1 partition); bunları okuyan consumer yoktur, yeniden işleme elle yapılır.
* **Producer zaman sınırları:** `max.block.ms` 10 sn, `request.timeout.ms` 10 sn, `delivery.timeout.ms` 20 sn; broker kapalıyken outbox worker süresiz beklemez.
* **Yapılandırma:** Producer/consumer ayarları `src/main/resources/config/application-core.yml` içindedir. `@Scheduled` job'ları 4 thread'lik havuzu paylaşır (`SCHEDULING_POOL_SIZE`).

---

## 4. Özet Mimari Matris

| İhtiyaç / Senaryo | Çözüm Bileşeni | Sağlanan Güvence |
| :--- | :--- | :--- |
| **Yüksek Trafikte Hızlı Stok Kontrolü** | Redis + Lua (`reserve_stock_with_ttl.lua`) | Sub-millisecond hız, Sıfır Over-Selling, DB kilidi yok. |
| **Checkout'ta Ürün Bekletme & Hoarding Önleme** | Rezervasyon key'i (TTL 15 dk) + reconciliation job'u | Süresi dolan rezervasyonun adedi bir sonraki reconciliation turunda stoğa döner. |
| **Ödeme Esnasında Çift Çekim Önleme** | Redis `SET NX` + DB `idempotencyKey` kontrolü | Aynı istek işlenirken 1 saat, tamamlandıktan sonra 24 saat boyunca tekrar çekim yapılmaz. |
| **DB & Kafka Dual-Write Tutarlılığı** | Transactional Outbox Pattern | Veritabanı transaction'ı rollback olursa Kafka'ya event gitmez. |
| **Mükerrer Kafka Mesajı Tüketimi** | `ProcessedKafkaEvent` (PostgreSQL Deduplication) | At-least-once teslimat üzerinde uygulama seviyesinde effectively-once işleme. |
| **Ağır Okuma Sorguları (Katalog / Lokasyon)** | Multi-Tier Redis Cache (`v4:`) | Deterministic `@class` serialization; tekrar eden okumalar veritabanına gitmez. |
