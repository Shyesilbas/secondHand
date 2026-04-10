# Favorite Paketi Teknik Rehber

- Paketin sorumluluklarini netlestirmek
- Degisiklik yaparken dogru dosyaya gitmeyi kolaylastirmak
- Davranis, performans ve yan etki risklerini azaltmak

## 1) Paketin Sorumlulugu

`favorite` paketi su islevlerden sorumludur:
- Kullanici listing favorileme / favoriden cikarma
- Favorite toggle davranisi
- Kullanicinin favori listinglerini sayfali donme
- Tekil ve toplu favorite istatistikleri (count + isFavorited)
- En cok favorilenen listinglerin alinmasi

Bu paket, listing detaylarini kendisi olusturmaz; `listing` katmani ile entegre calisir.

## 2) Paket Yapisi ve Dosya Rehberi

- `api/FavoriteController.java`
  - HTTP endpointleri.
  - Sadece request/cozumleme ve service delegasyonu yapar.

- `application/FavoriteService.java`
  - Paketin ana orkestrasyon noktasi.
  - Is kurallari, transaction sinirlari, cache invalidation, notification publish burada.

- `application/FavoriteStatsService.java`
  - Tekil/toplu istatistik hesaplama.
  - `favoriteStatsBatch` cache kullanimi burada.

- `application/ListingAccessService.java`
  - Listing okunabilirligi ve aktiflik dogrulamasi.
  - Listing bagimli temel guard kurallari burada tutulur.

- `domain/repository/FavoriteRepository.java`
  - Tum query ve persistence operasyonlari.
  - Performans kritik sorgularin ilk optimize edilecegi yer.

- `domain/mapper/FavoriteMapper.java`
  - `Favorite -> FavoriteDto` mapleme.

- `domain/entity/Favorite.java`
  - Tablo modeli, unique constraint, index tanimlari.

- `domain/dto/*`
  - Request/Response modelleri.

- `util/FavoriteErrorCodes.java`
  - Domain error kodlari ve HTTP statuleri.

- `config/FavoriteApiConfig.java`
  - API boyut/page defaults ve limit cozumleme.

## 3) Ana Akislar

### 3.1 Favoriye Ekle
1. `FavoriteController.addToFavorites`
2. `FavoriteService.addToFavorites`
3. Kullanici cozumleme: `resolveUser`
4. Listing bulma + aktiflik kontrolu: `ListingAccessService`
5. Kendi ilani kontrolu
6. `favoriteRepository.save`
7. Unique constraint ihlali varsa `ALREADY_FAVORITED`
8. Basariliysa event publish (notification), hata olursa log+devam

Not:
- Notification hatasi favorite islemini geri almaz.
- `@CacheEvict(value = "favoriteStatsBatch", allEntries = true)` ile stats cache temizlenir.

### 3.2 Favoriden Cikar
1. `FavoriteController.removeFromFavorites`
2. `FavoriteService.removeFromFavorites`
3. `deleteByUserAndListingIdIfExists` ile atomik silme denemesi
4. `deletedRows == 0` ise `NOT_FAVORITED`

Bu tasarim, once-var-mi-sonra-sil yarisi yerine tek DB operasyonu ile daha guvenlidir.

### 3.3 Toggle
1. `existsByUserAndListingId`
2. Varsa remove, yoksa add
3. En sonda guncel stats donulur

Not:
- Toggle, add/remove private metotlarindan gectigi icin kurallar tek yerde korunur.

### 3.4 Favorite Stats (Tekli / Coklu)
- Tekli: `FavoriteStatsService.getFavoriteStats`
  - `countByListingId`
  - `existsByUserIdAndListingId`

- Coklu: `FavoriteStatsService.getFavoriteStatsForListings`
  - Input normalize (`null` filtre + distinct)
  - Batch count query: `countByListingIds`
  - User favorileri batch query
  - DTO map donusu

## 4) Is Kurallari (Business Rules)

- Inactive listing favorilenemez: `INACTIVE_LISTING`
- Kullanici kendi ilani favorileyemez: `OWN_LISTING`
- Ayni kayit tekrar eklenemez: `ALREADY_FAVORITED`
- Olmayan favorite silinemez: `NOT_FAVORITED`
- Olmayan listing favorilenemez: `LISTING_NOT_FOUND`

Yeni kural eklenirken:
1. Ilgili hata kodunu `FavoriteErrorCodes` icine ekle
2. Kurali `FavoriteService` veya `ListingAccessService` icinde uygula
3. Test impact alanlarini kontrol et (controller response + repository davranisi)

## 5) Veri Modeli ve Performans Notlari

`Favorite` entity:
- Unique constraint: `(user_id, listing_id)`
- Indexler:
  - `idx_favorite_user`
  - `idx_favorite_listing`
  - `idx_favorite_created`

Performans kritik noktalar:
- `findByUserWithListingAndSeller` fetch join ile N+1 riskini azaltir.
- Toplu stats endpointlerinde tek tek count yerine batch query kullanilir.
- Stats cache key su an `Objects.hash(listingIds) + '_' + userId`:
  - Ayni id seti farkli sirada gelirse cache miss olabilir.
  - Collision teorik olarak mumkun.
  - Ihtiyac olursa review paketindeki gibi stabil/sirali key uretilmelidir.

## 6) Cache ve Transaction Davranisi

- Yazma operasyonlari:
  - `addToFavorites`, `removeFromFavorites`, `toggleFavorite`
  - `@Transactional` + `@CacheEvict(allEntries = true)`

- Okuma operasyonlari:
  - Class seviyesi `@Transactional(readOnly = true)`
  - Stats batch metodu `@Cacheable`

Degisiklik yaparken kural:
- Favorite sayisini etkileyen her yeni yazma operasyonunda ayni cache eviction stratejisi korunmali.

## 7) Endpoint Haritasi

Taban yol: `/api/favorites`

- `POST /` : favoriye ekle
- `DELETE /{listingId}` : favoriden cikar
- `POST /toggle` : toggle
- `GET /` : kullanici favorileri (page/size)
- `GET /stats/{listingId}` : tek listing stats
- `POST /stats` : toplu listing stats
- `GET /check/{listingId}` : favorilenmis mi
- `GET /count/{listingId}` : toplam favori sayisi
- `GET /ids` : kullanicinin favori listing id listesi
- `GET /top` : en cok favorilenenler (id + count tabanli)
- `GET /top-listings` : en cok favorilenenler (listing detayli)

## 8) Sik Degisiklik Senaryolari

### Senaryo A: Yeni endpoint eklemek
1. `FavoriteController` icine endpoint ekle
2. Is mantigini `FavoriteService` veya `FavoriteStatsService` icine tasi
3. Yeni hata durumu varsa `FavoriteErrorCodes` guncelle
4. Gerekirse `FavoriteApiConfig` ile boyut/limit merkezi hale getir

### Senaryo B: Yeni is kurali eklemek
1. Kuralin owner katmanini sec:
   - Listing durumuna bagliysa `ListingAccessService`
   - Favorite davranisina bagliysa `FavoriteService`
2. Kurali tek noktada uygula, tekrar olusturma
3. Response kodu icin enum tabanli hata kullan

### Senaryo C: Performans iyilestirme
1. Once repository querylerini incele (`FavoriteRepository`)
2. Batch endpointte tek tek query var mi kontrol et
3. Gerekirse projection veya fetch optimizasyonu ekle
4. Cache key davranisini veri dagilimina gore optimize et

### Senaryo D: Notification akisina degisiklik
1. `FavoriteService.addToFavorites` icindeki publish blogunu guncelle
2. Yan etki hatalarinin favori ana akisina zarar vermedigini koru
3. Idempotency key semasini degistirirken tekrarli event riskini dusun

## 9) AI Ajanlari Icin Hizli Calisma Protokolu

Bu paket uzerinde otomatik degisiklik yapacak ajanlar:
1. Once akisi `Controller -> Service -> Repository -> Mapper -> DTO` sirasiyla oku
2. Yazma operasyonlarinda cache eviction ve transaction semantigini bozma
3. Hata yonetiminde hardcoded string yerine `FavoriteErrorCodes` kullan
4. Toplu endpointlerde N+1 uretecek tasarimlardan kacin
5. Query imzasi degisirse cagirilan tum katmanlari birlikte guncelle

## 10) Kod Kalitesi ve Bakim Kurallari

- Service icinde yalnizca orkestrasyon + business rule olsun
- Repository query adlari amac odakli olsun
- DTO/mapper degisikliklerinde backward compatibility etkisi not edilsin
- Yeni config ihtiyaclari `FavoriteApiConfig` altina alinmali
- Yan etki (notification gibi) islemlerinde fail-safe davranis korunmali

## 11) Bilinen Gelistirme Firsatlari

- `FavoriteStatsService` cache key stabil hale getirilebilir (siradan bagimsiz key).
- `FavoriteRepository.countByListingIds` typed projection'a tasinarak `Object[]` bagimliligi azaltilabilir.
- Favori liste endpointlerinde metrik/telemetry arttirilabilir (P95, cache hit-rate).

Bu rehberdeki prensipler korunursa, favorite paketi daha ongorulebilir, performansli ve bakimi kolay kalir.
