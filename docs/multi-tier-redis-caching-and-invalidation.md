# Multi-Tier Polymorphic Redis Cache (`v4::`) ve Invalidation Stratejisi Rehberi

Bu doküman, **secondHand** platformunun **Çok Katmanlı Önbellek (Multi-Tier Caching)** mimarisini, **Jackson Polymorphic Type Serialization (`@class`)** standardını, **Cache Key Versioning (`v4::`)** yapısını ve **Cache Invalidation (Tahliye) Matrisini** detaylandırmaktadır.

---

## 1. Problem Tanımı ve Neden Özel Bir Cache Mimarisi?

Büyük ölçekli Spring Boot uygulamalarında standart Redis önbellekleme kullanıldığında şu kronik sorunlar yaşanır:
1. **Jackson Asimetri & Deserialization Hataları:** `PageImpl`, `CachedPage` (Java record), `UUID` ve enum tipleri cache'e yazılırken `@class` bilgisi kaybedilirse, okuma anında `LinkedHashMap cannot be cast to DTO` hatası oluşur.
2. **Cache Zehirlenmesi (Cache Drift / Corrupted Schema):** DTO'da bir alan değiştirildiğinde Redis'teki eski format deserialize edilemez ve uygulama çöker.
3. **Tek Boyutlu TTL Yetersizliği:** Statik il/ilçe verisi ile hızlı değişen vitrin ilanlarına aynı TTL süresini vermek DB yükünü artırır veya bayat veri sunar.

### secondHand Çözümü:
* **Deterministik ve Simetrik Jackson Serializer:** `GenericJackson2JsonRedisSerializer` üzerinde `DefaultTyping.EVERYTHING` ile root, nested ve leaf tüm seviyelerde `@class` taşınır.
* **Key Prefix Versiyonlama (`v4::`):** Schema değişimlerinde versiyon artırılır; eski cache anahtarlarına erişilmez, TTL ile kendiliğinden temizlenir.
* **Kademeli TTL Hiyerarşisi (Tier 0 $\rightarrow$ Tier 4):** Verinin değişim sıklığına göre optimize edilmiş TTL katmanları.

---

## 2. Kademeli TTL Hiyerarşisi (Tiered Architecture)

[`CacheConfig.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/CacheConfig.java) üzerinde tanımlanan katmanlar:

| Katman | TTL Süresi | Cache İsimleri | Veri Karakteristiği / Amacı |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **7 Gün** | `locations` | Türkiye il/ilçe/mahalle coğrafi ağacı. Değişmez, restart-safe, JVM heap'te tutulmaz. |
| **Tier 0b** | **3 Gün** | `aiSummaries` | Gemini AI tarafından üretilen ürün yorum analiz özetleri. |
| **Tier 1** | **24 Saat** | `brands`, `vehicleTypes`, `electronicTypes`, `bookGenres`, `clothingTypes` | Statik katalog, marka ve kategori lookup tabloları. |
| **Tier 2** | **2 Saat** | `completedOrder`, `paymentHistory`, `paymentStats`, `exchangeRates` | Tamamlanmış finansal geçmiş ve döviz kurları. |
| **Tier 2b** | **15 Dk** | `userProfile` | Kullanıcı hesap bilgileri ve ayarları. |
| **Tier 3** | **10 Dk** | `reviewStatsBatch`, `favoriteStatsBatch`, `sellerViewStats`, `userListings` | Toplu aggregation istatistikleri ve satıcı dashboard verileri. |
| **Tier 3b / 4** | **5 Dk** | `pendingOrders`, `listingViewStats`, `activeShowcases`, `userBadges` | Hızlı değişen anlık vitrin ilanları, rozetler ve geçici sayaçlar. |

---

## 3. Serileştirme & Güvenlik Mimarisi

### A. Whitelist Tabanlı Polymorphic Tip Doğrulayıcı
Güvenlik açığı (Gadget Attack) riskini sıfırlamak için yalnızca belirlenen güvenli paketlerin serileştirilmesine izin verilir:
```java
BasicPolymorphicTypeValidator validator = BasicPolymorphicTypeValidator.builder()
        .allowIfSubType("com.serhat.secondhand")
        .allowIfSubType("java.util")
        .allowIfSubType("java.time")
        .allowIfSubType("java.lang")
        .allowIfSubType("java.math")
        .allowIfSubType("org.springframework.data.domain")
        .allowIfSubTypeIsArray()
        .build();
```

### B. Versiyonlu Prefix Üretici
```java
private static final String CACHE_VERSION = "v4";

RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
        .computePrefixWith(cacheName -> CACHE_VERSION + "::" + cacheName + "::")
        .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(SerializationPair.fromSerializer(jsonSerializer));
```
* **Örnek Anahtar:** `v4::locations::istanbul` veya `v4::userProfile::105`

---

## 4. Cache Invalidation (Tahliye) Matrisi

Veri güncellendiğinde veya silindiğinde önbelleğin tutarlı kalması için uygulanan tahliye kuralları:

| Olay / Değişiklik | Tetiklenen Servis | Tahliye Edilen Cache(ler) (`@CacheEvict`) |
| :--- | :--- | :--- |
| **Yeni Ödeme Tamamlandı** | `EscrowService` / `PaymentProcessor` | `paymentStats` (all entries), `paymentHistory` |
| **Yeni Yorum Eklendi** | `ReviewService` | `reviewStatsBatch`, `sellerViewStats` |
| **Vitrin Paketi Satın Alındı** | `ShowcaseService` | `activeShowcases` |
| **Kullanıcı Bilgisi Değişti** | `UserService` | `userProfile::[userId]`, `userBadges::[userId]` |
| **Yeni İlan Eklendi / Silindi** | `ListingCommandService` | `userListings::[sellerId]` |

---

## 5. Hata Toleransı & Dayanıklılık (Resilience)

### A. Redis Çökmesinde Kesintisiz Hizmet ([`CacheErrorHandlerConfig.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/CacheErrorHandlerConfig.java))
Redis geçici olarak erişilemez olduğunda veya timeout verdiğinde, uygulama `500 Internal Server Error` **vermez**. `CacheErrorHandler` hataları sessizce loglar ve isteği doğrudan PostgreSQL veritabanından şeffaf bir şekilde çeker.

### B. Uygulama Başlangıç Temizliği ([`CacheStartupCleaner.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/CacheStartupCleaner.java))
Uygulama bootstrap anında ayağa kalkarken geçici sayaç veya eski kilit anahtarlarını temizleyerek temiz bir başlangıç durumu garantiler.
