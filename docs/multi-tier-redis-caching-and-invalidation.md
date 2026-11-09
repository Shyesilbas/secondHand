# Multi-Tier Redis Cache (`v4:`) ve Invalidation Rehberi

Bu doküman, **secondHand** backend'indeki Spring Cache + Redis yapısını (TTL tier'ları, key formatı, serialization, eviction matrisi, hata davranışı) kod ile doğrulanmış haliyle anlatır. Tek kaynak: [`CacheConfig.java`](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java).

---

## 1. Tasarım Özeti

* **Tek, simetrik serializer:** `GenericJackson2JsonRedisSerializer` + izole `ObjectMapper`; `DefaultTyping.EVERYTHING` ve `As.PROPERTY` ile root, nested ve final tipler (`CachedPage` record, `UUID`, enum) dahil her değere `@class` yazılır. Böylece okuma sırasında `LinkedHashMap cannot be cast` türü hatalar oluşmaz. `@JsonTypeInfo` taşıyan DTO'larda (`ListingDto`, `ListingFilterDto`) Jackson'ın kendi discriminator'ı önceliklidir.
* **Key versioning:** Prefix `CACHE_VERSION + ":" + cacheName + ":"` biçimindedir (tek `:`). Örnek: `v4:user:profile:105`. Serializer/DTO formatı uyumsuz değişirse `CACHE_VERSION` artırılır; eski key'ler okunmaz ve TTL ile kendiliğinden silinir.
* **Null cache'lenmez** (`disableCachingNullValues`). TTL'i tanımsız bir cache adı için varsayılan TTL **30 dakika**dır.
* **`allEntries` eviction `SCAN` ile yapılır** (`BatchStrategies.scan(1000)`), `KEYS` kullanılmaz; Redis bloklanmaz.
* **Whitelist tip doğrulayıcı:** `com.serhat.secondhand`, `java.util`, `java.time`, `java.lang`, `java.math`, `org.springframework.data.domain` ve array tipleri dışındaki `@class` deserialize edilmez.

---

## 2. TTL Tier'ları ve Cache İsimleri

| Tier | TTL | Cache adı | Kullanım (`@Cacheable` yeri) |
| :--- | :--- | :--- | :--- |
| 0b | 3 gün | `ai:summaries` | `AiSummaryService` (key `user:<id>` / `listing:<id>`; "özet yok" mesajı cache'lenmez) |
| 1 | 24 saat | `catalog:brands`, `catalog:vehicleTypes`, `catalog:electronicTypes`, `catalog:bookGenres`, `catalog:clothingTypes` | İlgili `*Repository` `findAll` / `findByName` |
| 1 | 24 saat | `catalog:attributeDefinitions`, `catalog:vehicle` | `ListingAttributeCatalogService`, `VehicleCatalogService` |
| 1b | 12 saat | `user:stats:favorites` | `FavoriteStatsService` |
| 2 | 2 saat | `order:completed`, `payment:stats` | `OrderQueryService`, `PaymentStatsService` |
| 2 | 2 saat | `payment:exchangeRates` | `ExchangeRateService` (key `<FROM>_<TO>`) |
| 2 | 2 saat | `payment:history` | TTL tanımlı, ancak kodda `@Cacheable` kullanımı **yok** |
| 2b | 15 dk | `user:profile` | `UserService` |
| 3 | 10 dk | `user:stats:reviews`, `listing:views:seller`, `listing:userListings` | `ReviewService`, `ListingViewService`, `ListingQueryService` |
| 3b | 5 dk | `order:pending`, `listing:views:listing` | `OrderQueryService`, `ListingViewService` |
| 3b | 5 dk | `listing:showcases` | TTL tanımlı, ancak kodda `@Cacheable` kullanımı **yok** |
| 4 | 5 dk | `user:badges` | `UserBadgeService` |

> [!NOTE]
> Konum kataloğu (il/ilçe/mahalle) `CacheManager` üzerinden değil, [`LocationCatalogService`](../src/main/java/com/serhat/secondhand/listing/application/common/LocationCatalogService.java) içinde `RedisTemplate<String, Object>` ile doğrudan yazılır. Key'ler `v6:catalog:locations:cities`, `v6:catalog:locations:districts` (hash), `v6:catalog:locations:neighborhoods` (hash); TTL 7 gün. Bu key'ler `CACHE_VERSION`'dan bağımsız kendi `v6` versiyonunu taşır; biri eksikse ilk okumada katalog yeniden yüklenir.

---

## 3. Eviction Matrisi

| Olay | Eviction yapan sınıf | Cache / key |
| :--- | :--- | :--- |
| Ödeme / cüzdan işlemi | `EWalletService` (4 metot), `PaymentProcessor` (`cacheManager.getCache("payment:stats").clear()`) | `payment:stats` (all entries) |
| Yorum eklendi | `ReviewService` | `user:stats:reviews` (all entries) |
| Favori ekle/çıkar | `FavoriteService` (3 metot) | `user:stats:favorites` (all entries) |
| Kullanıcı güncellendi | `UserService` | `user:profile` (`#user.id`) |
| İlan publish/güncelle vb. | `ListingCommandService` (sınıf `@CacheConfig(cacheNames = "user:profile")`, 10 metot `@CacheEvict(allEntries = true)`) | `user:profile` (all entries) |
| İlan oluştur/güncelle/sil | `AbstractListingService` (3 metot) | `listing:userListings` (all entries) |
| Kampanya oluştur/güncelle/sil | `CampaignService` (3 metot) | `listing:userListings` (all entries). Planlı başlangıç/bitiş eviction tetiklemez; 10 dk TTL ile yenilenir. |
| Sipariş tamamlandı | `OrderCompletionService` | `order:pending` (`#user.id`) |
| Bildirim okundu / e-posta durumu | `NotificationService` (2), `EmailService` (3) | `user:badges` (`#userId`) |
| Seed çalıştı | `CatalogSeedStartupRunner.evictCatalogCaches` | `catalog:*` adı ile başlayan tüm cache'ler `clear()` |
| Vehicle / attribute initializer | `VehicleDataInitializer`, `ListingAttributeDataInitializer` | `catalog:vehicle`, `catalog:attributeDefinitions` |

Eviction olmayan (yalnızca TTL ile yenilenen) cache'ler: `ai:summaries`, `order:completed`, `listing:views:*`, `catalog:*` (seed dışında), `listing:userListings` için satıcı dışı değişiklikler.

---

## 4. Fault Tolerance

[`CacheErrorHandlerConfig`](../src/main/java/com/serhat/secondhand/core/config/CacheErrorHandlerConfig.java) cache GET/PUT/EVICT/CLEAR hatalarını `warn` olarak loglar ve isteği yutmaz:

* **GET hatası** (Redis erişilemez veya bozuk/uyumsuz JSON): method gövdesi çalışır, sonuç DB'den gelir; ayrıca bozuk key için best-effort `evict` denenir.
* **PUT hatası:** cache doldurulamaz, sonraki istek tekrar DB'ye gider.
* **EVICT/CLEAR hatası:** yutulur. Redis geri geldiğinde ilgili key **TTL dolana kadar bayat** kalabilir; bu bilinen bir trade-off'tur.

[`CacheStartupCleaner`](../src/main/java/com/serhat/secondhand/core/config/CacheStartupCleaner.java) tamamen yorum satırındadır; **açılışta cache veya Redis DB flush edilmez**. Format değişikliklerinde çözüm `CACHE_VERSION`'ı artırmaktır.

---

## 5. Yeni Cache Ekleme

1. [`CacheConfig`](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java) içinde uygun TTL config'i ile `.withCacheConfiguration("<modül>:<ad>", ...)` ekle; eklenmezse 30 dk varsayılanı geçerli olur.
2. Servis metoduna `@Cacheable(value = "<modül>:<ad>", key = ...)` koy. Dönüş tipi `@class` ile serialize edilebilmeli ve izinli paketlerde olmalı (`com.serhat.secondhand.*`).
3. Veriyi değiştiren her yola `@CacheEvict` ekle; key'i `allEntries` mı tekil mi seçerken `@Cacheable` key formatına bak (ör. `payment:stats` key'i `userId_provider` olduğu için tamamı temizlenir).
4. Public bir proxy çağrısı gerekir: aynı sınıf içi (self-call) çağrılarda Spring Cache devreye girmez.
5. Serialization formatı kırıcı değişirse `CACHE_VERSION`'ı artır.
