# Multi-Tier Redis Cache (`v4:`) ve Invalidation Rehberi

Bu doküman, **secondHand** backend'indeki Spring Cache + Redis yapısını (TTL tier'ları, key formatı, serialization, eviction matrisi, hata davranışı) kod ile doğrulanmış haliyle anlatır. Tek kaynak: [`CacheConfig.java`](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java).

---

## 1. Tasarım Özeti

* **Tek, simetrik serializer:** `GenericJackson2JsonRedisSerializer` + izole `ObjectMapper`; `DefaultTyping.EVERYTHING` ve `As.PROPERTY` ile root, nested ve final tipler (`CachedPage` record, `UUID`, enum) dahil her değere `@class` yazılır. Böylece okuma sırasında `LinkedHashMap cannot be cast` türü hatalar oluşmaz. `@JsonTypeInfo` taşıyan DTO'larda (`ListingDto`, `ListingFilterDto`) Jackson'ın kendi discriminator'ı önceliklidir.
* **Key versioning:** Prefix `CACHE_VERSION + ":" + cacheName + ":"` biçimindedir (tek `:`). Örnek: `v4:user:profile:105`. Serializer/DTO formatı uyumsuz değişirse `CACHE_VERSION` artırılır; eski key'ler okunmaz ve TTL ile kendiliğinden silinir.
* **Null cache'lenmez** (`disableCachingNullValues`). TTL'i tanımsız bir cache adı için varsayılan TTL **30 dakika**dır.
* **`allEntries` eviction `SCAN` ile yapılır** (`BatchStrategies.scan(1000)`), `KEYS` kullanılmaz; Redis bloklanmaz.
* **Transaction-aware:** `RedisCacheManager.builder(...).transactionAware()`; transaction içindeki put ve evict'ler commit sonrasına ertelenir. Commit'ten önce yapılan bir evict, eşzamanlı bir okumanın eski satırı TTL boyunca tekrar cache'lemesine izin verirdi.
* **Map key tipi korunmaz:** Düz bir `HashMap<UUID, ...>` cache'ten `String` key'lerle döner ve `map.get(uuid)` her zaman `null` verir. Bu yüzden listing bazlı istatistikler adlandırılmış alt sınıf döndürür (`ListingReviewStatsMap`, `ListingFavoriteStatsMap`); `@class` bu sınıfı taşıdığı için key'ler `UUID` olarak geri gelir. Sınıfı tanıtan değişiklikte key'e `typed:` öneki eklendi; eski formatlı kayıtlar okunmaz.
* **Whitelist tip doğrulayıcı:** `com.serhat.secondhand`, `java.util`, `java.time`, `java.lang`, `java.math`, `org.springframework.data.domain` ve array tipleri dışındaki `@class` deserialize edilmez.

---

## 2. TTL Tier'ları ve Cache İsimleri

| Tier | TTL | Cache adı | Kullanım (`@Cacheable` yeri) |
| :--- | :--- | :--- | :--- |
| 0b | 3 gün | `ai:summaries` | `AiSummaryService` (key `user:<id>` / `listing:<id>`; "özet oluşturulamadı" mesajı cache'lenmez; yeni yorumda yenileme kuralı eviction matrisinde) |
| 1 | 24 saat | `catalog:enums` | `EnumReadService` (`'dbBundle'` ve tekil lookup'lar; DTO çıktısı cache'lenir, katalog repository'leri JPA entity döndürdüğü için cache'lenmez) |
| 1 | 24 saat | `catalog:attributeDefinitions`, `catalog:vehicle` | `ListingAttributeCatalogService`, `VehicleCatalogService` |
| 1b | 12 saat | `user:stats:favorites` | `FavoriteStatsService` |
| 2 | 2 saat | `order:completed`, `payment:stats` | `OrderQueryService`, `PaymentStatsService` (key `user:<id>:<ALL\|EWALLET>`; başka provider filtresi cache'lenmez) |
| 2 | 2 saat | `payment:exchangeRates` | `ExchangeRateService` (key `<FROM>_<TO>`) |
| 2b | 15 dk | `user:profile` | `UserService` |
| 3 | 10 dk | `user:stats:reviews`, `listing:views:seller`, `listing:userListings`, `listing:bestSellers` | `ReviewService`, `ListingViewService`, `ListingQueryService`, `ListingSalesRankingService` (yalnızca sıralı ID'ler) |
| 3b | 5 dk | `listing:views:listing`, `dashboard:seller`, `dashboard:buyer` | `ListingViewService`, `DashboardService` |
| 3b | 5 dk | `listing:globalStats`, `listingStats` | `ListingStatisticsService`, `ListingRepository` sayım sorguları |

> [!NOTE]
> Konum kataloğu (il/ilçe/mahalle) `CacheManager` üzerinden değil, [`LocationCatalogService`](../src/main/java/com/serhat/secondhand/listing/application/common/LocationCatalogService.java) içinde `RedisTemplate<String, Object>` ile doğrudan yazılır. Key'ler `v6:catalog:locations:cities`, `v6:catalog:locations:districts` (hash), `v6:catalog:locations:neighborhoods` (hash); TTL 7 gün. Bu key'ler `CACHE_VERSION`'dan bağımsız kendi `v6` versiyonunu taşır; biri eksikse ilk okumada katalog yeniden yüklenir.

---

## 3. Eviction Matrisi

| Olay | Eviction yapan sınıf | Cache / key |
| :--- | :--- | :--- |
| Ödeme / cüzdan / escrow işlemi | `PaymentStatsCacheEvictor` (`PaymentProcessor`, `EWalletService` 4 metot, `EscrowService` hold/release/cancel/refund) | `payment:stats`, yalnızca etkilenen kullanıcıların (ödeyen, alan, alıcı, satıcı) key'leri |
| Yorum eklendi | `ReviewService`; `ReviewCreatedEvent` -> `AiSummaryCacheInvalidationListener` (AFTER_COMMIT) | `user:stats:reviews` (all entries); `ai:summaries` `user:<satıcı>` / `listing:<ilan>` yalnızca cache'teki metin "henüz yorum yok" ise ya da son özetten beri `ai.summary.refresh-after-new-reviews` (varsayılan 5) yorum geldiyse silinir. Sayaç: `v4:ai:summary:new_reviews:<key>` (`ExpiringCounter`, TTL `AiSummaryService.CACHE_TTL`). Böylece her yorum Gemini çağrısı tetiklemez. |
| Favori ekle/çıkar | `FavoriteService` (3 metot) | `user:stats:favorites` (all entries) |
| Kullanıcı güncellendi | `UserService` | `user:profile` (`#user.id`) |
| İlan publish/güncelle vb. | `ListingCommandService` (sınıf `@CacheConfig(cacheNames = {"user:profile", "listing:userListings"})`, isimsiz `@CacheEvict(allEntries = true)`) | `user:profile`, `listing:userListings` (all entries) |
| Satış sonrası stok düşümü / `SOLD` | `InventoryKafkaConsumer.consumePaymentCompleted` | `listing:userListings`, `user:profile` (all entries) |
| Moderasyon ile ilan kaldırma | `ListingModerationService` (2 metot) | `user:profile`, `listing:userListings` (all entries) |
| İlan oluştur/güncelle/sil | `AbstractListingService` (3 metot) | `listing:userListings` (all entries) |
| Kampanya oluştur/güncelle/sil | `CampaignService` (3 metot) | `listing:userListings` (all entries). Planlı başlangıç/bitiş eviction tetiklemez; 10 dk TTL ile yenilenir. |
| Seed çalıştı | `CatalogSeedStartupRunner.evictCatalogCaches` | `catalog:*` adı ile başlayan tüm cache'ler `clear()` |
| Vehicle / attribute initializer | `VehicleDataInitializer`, `ListingAttributeDataInitializer` | `catalog:vehicle`, `catalog:attributeDefinitions` |

Eviction olmayan (yalnızca TTL ile yenilenen) cache'ler: `order:completed`, `listing:views:*`, `catalog:*` (seed dışında), `listing:userListings` için satıcı dışı değişiklikler.

---

## 4. Fault Tolerance

[`CacheErrorHandlerConfig`](../src/main/java/com/serhat/secondhand/core/config/CacheErrorHandlerConfig.java) `CachingConfigurer` olarak handler'ı sağlar ve cache GET/PUT/EVICT/CLEAR hatalarını `warn` olarak loglar, isteği düşürmez. Spring yalnızca `CachingConfigurer` üzerinden gelen handler'ı kullanır; düz bir `CacheErrorHandler` bean'i yok sayılır ve her cache hatası 500 olur (`CacheErrorHandlerConfigTest`):

* **GET hatası** (Redis erişilemez veya bozuk/uyumsuz JSON): method gövdesi çalışır, sonuç DB'den gelir; ayrıca bozuk key için best-effort `evict` denenir.
* **PUT hatası:** cache doldurulamaz, sonraki istek tekrar DB'ye gider.
* **EVICT/CLEAR hatası:** yutulur. Redis geri geldiğinde ilgili key **TTL dolana kadar bayat** kalabilir; bu bilinen bir trade-off'tur.

[`CacheStartupCleaner`](../src/main/java/com/serhat/secondhand/core/config/CacheStartupCleaner.java) tamamen yorum satırındadır; **açılışta cache veya Redis DB flush edilmez**. Format değişikliklerinde çözüm `CACHE_VERSION`'ı artırmaktır.

---

## 5. Yeni Cache Ekleme

1. [`CacheConfig`](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java) içinde uygun TTL config'i ile `.withCacheConfiguration("<modül>:<ad>", ...)` ekle; eklenmezse 30 dk varsayılanı geçerli olur.
2. Servis metoduna `@Cacheable(value = "<modül>:<ad>", key = ...)` koy. Dönüş tipi `@class` ile serialize edilebilmeli ve izinli paketlerde olmalı (`com.serhat.secondhand.*`). DTO'nun no-arg constructor'ı olmalı ya da record olmalı; `Page` yerine `CachedPage` kullan (`PageImpl` deserialize edilemez). Key'i `String` olmayan bir `Map` döndürme; adlandırılmış alt sınıf kullan (bkz. `ListingStatsCacheRoundTripTest`).
3. Veriyi değiştiren her yola `@CacheEvict` ekle. Kullanıcı bazlı bir cache'i `allEntries` ile temizleme; key'i sonlu bir kümeden üret ki etkilenen kullanıcının key'leri tek tek silinebilsin (ör. `PaymentStatsCacheEvictor`). Hızlı değişen sayaçları (badge, bekleyen sipariş) cache'leme. JPA entity cache'leme; DTO cache'le.
4. Public bir proxy çağrısı gerekir: aynı sınıf içi (self-call) çağrılarda Spring Cache devreye girmez.
5. Serialization formatı kırıcı değişirse `CACHE_VERSION`'ı artır.
6. Cache adı, doğrudan yazılan Redis key'leriyle (`v4:inventory:stock:`, `v4:payment:idempotency:` vb.) aynı prefix'i paylaşmamalı; aksi halde `allEntries` eviction bu key'leri de siler. `RedisKeyNamespaceTest` çakışmayı yakalar; çözüm cache adını değiştirmektir, canlı key'i değil.
