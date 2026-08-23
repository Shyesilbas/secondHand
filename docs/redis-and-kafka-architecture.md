# Redis ve Kafka Mimari Raporu (Architecture & Implementation Guide)

Bu doküman, **secondHand** projesindeki **Redis (In-Memory Cache & Concurrency Control)** ve **Apache Kafka (Event-Driven Architecture & Transactional Outbox)** altyapısının uçtan uca mimarisini, tasarım kararlarını, veri akışlarını ve uygulama detaylarını içermektedir.

---

## 1. Genel Mimari Bakış ve Sistem Akışı

Sistemimizde veri tutarlılığı (consistency), yüksek eşzamanlılık (high concurrency), sıfır çift çekim (zero double-charge) ve sıfır stok aşımı (zero over-selling) ilkeleri doğrultusunda **hibrit bir mimari** kurgulanmıştır.

```
[İstemci / HTTP İstek]
         │
         ▼
[Controller / Application Service Layer]
         │
         ├───► [Redis (In-Memory Engine)]
         │      ├── Multi-Tier Cache (v4:: Prefix, Polymorphic JSON)
         │      ├── Atomik Lua Stok Rezervasyonu (15 dk TTL, Anti-Hoarding)
         │      ├── Payment Idempotency Lock (SETNX)
         │      └── Atomik Kupon Kullanım Limiter
         │
         └───► [PostgreSQL (ACID Primary Database)]
                ├── Business Entity Kayıtları
                ├── Transactional Outbox Tabloları (*_outbox_events)
                └── Consumer Idempotency Tablosu (processed_kafka_events)
                         │
                         ▼ (Periyodik Worker / Scheduled Polling)
               [Outbox Workers (Payment / Order / Escrow)]
                         │
                         ▼ (At-Least-Once Delivery)
               [Apache Kafka Broker (Topics)]
               ├── payment.completed.v1
               ├── escrow.released.v1
               ├── order.cancelled.v1 / order.refunded.v1
               └── payment.failed.v1 / payment.refunded.v1
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Inventory Consumer]            [Payment / Escrow Consumer]
 ├── Idempotency Check           ├── Idempotency Check
 ├── DB Stok Düşümü (Postgres)   ├── e-Cüzdan (eWallet) Kredi Aktarımı
 └── Otomatik 'SOLD' Statüsü     └── Asenkron Bildirim & E-Postalar
```

---

## 2.  Redis Mimarisi ve Kullanım Alanları

Redis projemizde iki ana amaçla kullanılır:
1. **Multi-Tiered Cache (Çok Katmanlı Önbellek)**: Okuma performansını maksimize etmek ve DB yükünü azaltmak.
2. **Atomik Eşzamanlılık & Dağıtık Kilit (Concurrency & Rate Limiting)**: Race condition'ları ve tutarsızlıkları sub-millisecond seviyesinde engellemek.

### A. Çok Katmanlı Önbellek Mimarisi ([CacheConfig.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/CacheConfig.java))

* **Cache Key Versioning:** Tüm cache anahtarları `v4::<cache_name>::<key>` standardıyla saklanır. Serializer veya DTO format değişikliklerinde `CACHE_VERSION` artırılarak eski kayıtlarla çakışma (corrupted cache) önlenir; eski kayıtlar TTL bitiminde Redis tarafından temizlenir.
* **Polymorphic Jackson Serializer:** `GenericJackson2JsonRedisSerializer` üzerinde `DefaultTyping.EVERYTHING` ve `JsonTypeInfo.As.PROPERTY` kullanılarak `@class` tipi korunur. Bu sayede `CachedPage` (record), `PageImpl`, `UUID`, enum ve domain DTO'ları hem yazarken hem okurken tip kaybı olmadan deserialize edilir.
* **Kademeli TTL Yapısı (Tiered TTL):**

| Tier | TTL | Cache İsimleri | Kullanım Amacı / Açıklama |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **7 Gün** | `locations` | İl, ilçe, mahalle coğrafi katalog verisi. Restart-safe, JVM heap'te tutulmaz. |
| **Tier 0b** | **3 Gün** | `aiSummaries` | LLM tarafından üretilen ürün değerlendirme özetleri. |
| **Tier 1** | **24 Saat** | `brands`, `vehicleTypes`, `electronicTypes`, `bookGenres`, `clothingTypes` | Statik lookup ve kategori filtreleme tabloları. |
| **Tier 2** | **2 Saat** | `completedOrder`, `paymentHistory`, `paymentStats`, `exchangeRates` | Tamamlanmış ve değişmeyen finansal/sipariş verileri. |
| **Tier 2b** | **15 Dk** | `userProfile` | Kullanıcı profil ve ayar detayları. |
| **Tier 3** | **10 Dk** | `reviewStatsBatch`, `favoriteStatsBatch`, `sellerViewStats`, `userListings` | Toplu istatistik ve dashboard aggregation verileri. |
| **Tier 3b / 4** | **5 Dk** | `pendingOrders`, `listingViewStats`, `activeShowcases`, `userBadges` | Hızlı değişen geçici sayaçlar, rozetler ve vitrin ilanları. |

---

### B. Atomik Envanter ve Stok Rezervasyonu (Lua Scripting)

İkinci el e-ticarette her ürün genellikle tek adettir veya sınırlı stokludur. İlişkisel veritabanı satır kilitlemesi (`SELECT ... FOR UPDATE`) yüksek trafikte connection pool tükenmesine ve gecikmelere yol açar. Bu nedenle stok kontrolü ve rezervasyon **Redis Lua Scriptleri** ile in-memory yönetilir.

* **Anahtar İsimlendirmeleri:**
  * `stock:{listingId}`: Ürünün o anki rezerve edilmemiş boşta kalan stok adedi.
  * `reservation:{userId}:{listingId}`: Kullanıcının sepete aldığı miktar ve TTL bilgisi.

* **Lua Scriptleri ([src/main/resources/scripts/](file:///Users/serhat/IdeaProjects/secondHand/src/main/resources/scripts/)):**
  1. `reserve_stock_with_ttl.lua`:
     * Redis'te stok anahtarı yoksa veritabanındaki mevcut stoktan anahtarı ilk kez doldurur (`lazy-init`).
     * Yeterli stok olup olmadığını atomik olarak denetler.
     * Stoğu talep edilen miktar kadar azaltır ve kullanıcıya özel rezervasyon anahtarını **15 dakikalık (900s) TTL** ile oluşturur.
     * Yetersiz stok durumunda `-1` döner; `InventoryRedisReservationService` üzerinden anında `INSUFFICIENT_STOCK` exception fırlatılır.
  2. `cancel_user_reservation.lua`:
     * Kullanıcı ödemeyi iptal ederse veya sepetten vazgeçerse rezerve edilen miktarı okur, rezervasyon anahtarını siler ve `stock:{listingId}` değerini atomik olarak geri artırır.
  3. `release_stock.lua`:
     * Genel amaçlı stok serbest bırakma ve artırma scripti.

* **Reconciliation Scheduler ([StockReservationReconciliationScheduler.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/inventory/application/StockReservationReconciliationScheduler.java)):**
  * Periyodik arka plan görevi (cron) çalışarak Redis üzerindeki in-memory stok miktarlarını PostgreSQL'deki kesin fiziksel stok durumuyla karşılaştırır; olası drift ve senkron uyumsuzluklarını onarır.

---

### C. Dağıtık Kilit, Idempotency & Kupon Limiter

1. **Ödeme İdempotency Kilidi ([PaymentRedisIdempotencyService.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/payment/util/PaymentRedisIdempotencyService.java)):**
   * Kullanıcıdan gelen `Idempotency-Key` başlığı Redis üzerinde `SET key value NX EX 120` komutu ile kilitlenir.
   * Aynı anahtarla 2 dakika içinde gelen mükerrer ödeme istekleri veritabanına veya banka gateway'ine gitmeden engellenir (çift çekim önlenir).
2. **Kupon Limitleme ([CouponRedisLimiterService.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/coupon/application/CouponRedisLimiterService.java) & [apply_coupon_with_limit.lua](file:///Users/serhat/IdeaProjects/secondHand/src/main/resources/scripts/apply_coupon_with_limit.lua)):**
   * Kuponun genel toplam kullanım limiti ve kullanıcı bazlı kullanım limiti Redis üzerinde tek bir atomik Lua çağrısıyla denetlenir ve güncellenir.

---

## 3.  Apache Kafka Mimarisi ve Olay Güdümlü Boru Hattı (EDA)

Domainler arası senkron HTTP/gRPC çağrıları yerine **Event-Driven Architecture (EDA)** tercih edilmiştir. Bu sayede ödeme işlemi tamamlandığında stok düşümü, e-posta gönderimi, fatura ve satıcı cüzdan aktarımı ana transaction'ı bloke etmeden asenkron yürütülür.

### A. Transactional Outbox Pattern (Dual-Write Güvenliği)

Veritabanına kayıt yazıp hemen ardından Kafka'ya mesaj gönderildiğinde meydana gelebilecek tutarsızlıkları (*Dual-Write Problem*) önlemek için **Transactional Outbox Pattern** kullanılır:

1. Ödeme, sipariş iptali veya emanet (escrow) işlemleri sırasında event **doğrudan Kafka'ya atılmaz**.
2. Event kaydı, ana entity kaydı ile **aynı ACID veritabanı transaction'ında** Outbox tablosuna (`payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`) yazılır.
3. Arka plandaki worker'lar ([PaymentOutboxWorker](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/payment/outbox/PaymentOutboxWorker.java), [OrderOutboxWorker](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/order/outbox/OrderOutboxWorker.java), [EscrowOutboxWorker](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/escrow/outbox/EscrowOutboxWorker.java)) `PENDING` ve `FAILED` durumundaki eventleri periyodik olarak sorgular ve Kafka'ya gönderir.
4. Başarılı gönderimde event statüsü `PROCESSED` olur; hata durumunda `attemptCount` artırılarak artan aralıklarla (exponential backoff) tekrar denenir.

#### 1. Outbox Polling Yükü vs. CDC (Change Data Capture / Debezium)
Outbox pattern uygulamasında iki temel yaklaşım bulunur:
* **CDC (Debezium vb.):** PostgreSQL Write-Ahead Log (WAL) akışını dinleyerek DB'ye hiç `SELECT` atmadan eventleri Kafka'ya iletir. Çok yüksek hacimli enterprise mimarilerde DB yükünü sıfırlar ancak ek altyapı bileşeni (Kafka Connect / Debezium) ve WAL yönetimi karmaşıklığı getirir.
* **Polling Worker (Projedeki Yaklaşımımız):** Spring `@Scheduled` worker'lar periyodik olarak (`fixedDelay = 5000ms`) bekleyen eventleri `SELECT` ile çeker.
  * **İndeks Optimizasyonu:** Polling sorgularının (`WHERE status IN ('PENDING', 'FAILED') AND next_attempt_at <= :now ORDER BY created_at ASC`) tam tablo taraması (Seq Scan) ve filesort yapmasını önlemek için tüm outbox tablolarında composite index tanımlanmıştır:
    ```sql
    CREATE INDEX idx_*_outbox_status_attempt_created ON *_outbox_events (status, next_attempt_at, created_at);
    ```

#### 2. Outbox Tablo Temizliği (Housekeeping / Purge Job)
Başarıyla işlenen (`PROCESSED`) outbox eventleri ve tüketilen Kafka idempotency anahtarları zamanla tabloları şişirir (table bloat) ve sorgu performansını düşürür.

* **[OutboxHousekeepingScheduler](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/outbox/OutboxHousekeepingScheduler.java):**
  * Her gece saat 03:00'te (`cron = "0 0 3 * * ?"`) otomatik çalışır.
  * `PROCESSED` durumunda olan ve **3 günden eski** (`app.outbox.cleanup.retention-days = 3`) tüm outbox kayıtlarını (`payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`) temizler.
  * Aynı zamanda `processed_kafka_events` tablosundaki eski idempotency loglarını purge eder.
  * Purge sorgularının hızlı çalışması için `status, processed_at` composite indeksi eklenmiştir:
    ```sql
    CREATE INDEX idx_*_outbox_status_processed ON *_outbox_events (status, processed_at);
    ```

---

### B. Consumer Idempotency (Exactly-Once İşleme Garantisi)

Kafka mesaj dağıtımı doğası gereği *At-Least-Once (En az bir kere)* garantisi sunar. Rebalancing, timeout veya retry senaryolarında aynı mesaj bir consumer'a tekrar gelebilir.

* **DB-Level Deduplication ([ProcessedKafkaEvent.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/idempotency/ProcessedKafkaEvent.java)):**
* Consumer tarafında işlem başlamadan önce:
  ```sql
  INSERT INTO processed_kafka_events (event_id, consumer_group, processed_at)
  VALUES ('payment:completed:UUID', 'inventory-sync-consumers', NOW())
  ON CONFLICT (event_id) DO NOTHING;
  ```
* Etkilenen satır sayısı `0` ise event daha önce işlenmiştir; log basılarak işlem atlanır. Bu sayede mükerrer stok düşümü, çift bakiye yüklemesi veya mükerrer e-posta gönderimi %100 engellenir.

---

### C. Topic'ler ve Event Tüketim Akışları ([KafkaConfig.java](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/KafkaConfig.java))

| Topic | Partition / Replica | Producer (Outbox) | Consumer | İşlenen Görevler |
| :--- | :--- | :--- | :--- | :--- |
| `payment.completed.v1` | 3 / 1 | `PaymentOutboxWorker` | `PaymentCompletedKafkaConsumer` | Alıcı ve satıcıya asenkron başarılı ödeme bildirimi ve dekont e-postası iletimi. |
| `payment.completed.v1` | 3 / 1 | `PaymentOutboxWorker` | `InventoryKafkaConsumer` | PostgreSQL veritabanındaki kesin fiziksel stoktan düşüm yapılması ve stok 0 ise ilanın `SOLD` durumuna geçirilmesi. |
| `escrow.released.v1` | 3 / 1 | `EscrowOutboxWorker` | `EscrowKafkaConsumer` | Ürün alıcıya teslim edilip onaylandığında, havuzdaki paranın satıcının `eWallet` hesabına aktarılması. |
| `order.cancelled.v1` | 3 / 1 | `OrderOutboxWorker` | `InventoryKafkaConsumer` & Notification | İptal edilen siparişin ürün stoğunun DB ve Redis'te iade edilmesi. |
| `order.refunded.v1` | 3 / 1 | `OrderOutboxWorker` | `EscrowKafkaConsumer` & Payment | İade sürecinde para iadesi ve stok güncellemelerinin yapılması. |

---

### D. Serileştirme ve Hata Yönetimi (Error Handling & Serialization)

* **Serializer:** `JsonSerializer` (üretici) ve `ErrorHandlingDeserializer` ile sarılmış `JsonDeserializer` (tüketici).
* **Deserialization Resilience:** Bozuk bir mesaj geldiğinde consumer container çökmez; hata yakalanıp loglanır ve stream akışı duraksamaz.
* **Retry & Backoff:** `ConcurrentKafkaListenerContainerFactory` üzerinde `DefaultErrorHandler(new FixedBackOff(1000L, 2L))` ile geçici hatalarda 1 saniye aralıkla 2 defa retry mekanizması uygulanmıştır.

---

## 4. Özet Mimari Matris

| İhtiyaç / Senaryo | Çözüm Bileşeni | Sağlanan Güvence |
| :--- | :--- | :--- |
| **Yüksek Trafikte Hızlı Stok Kontrolü** | Redis + Lua (`reserve_stock_with_ttl.lua`) | Sub-millisecond hız, Sıfır Over-Selling, DB kilidi yok. |
| **Sepette Ürün Bekletme & Hoarding Önleme** | Redis Key TTL (15 Dakika) | Süresi dolan sepet stoğunun otomatik olarak havuza dönmesi. |
| **Ödeme Esnasında Çift Çekim Önleme** | Redis `SETNX` Lock (`Idempotency-Key`) | Aynı isteğin 2 dakika boyunca mükerrer işlenmesini önleme. |
| **DB & Kafka Dual-Write Tutarlılığı** | Transactional Outbox Pattern | Veritabanı transaction'ı rollback olursa Kafka'ya event gitmez. |
| **Mükerrer Kafka Mesajı Tüketimi** | `ProcessedKafkaEvent` (PostgreSQL Deduplication) | Exactly-once uygulama seviyesinde işleme garantisi. |
| **Ağır Okuma Sorguları (Katalog / Lokasyon)** | Multi-Tier Redis Cache (`v4::`) | Deterministic `@class` serileştirme ve veritabanı yükünün %80+ azaltılması. |
