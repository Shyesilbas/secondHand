# Review Paketi Teknik Rehber

Bu dokumanin amaci:
- `review` paketinin sorumluluklarini ve kritik akislarini tek yerde netlestirmek
- Insan ve AI gelistiricilerin degisiklik yaparken etki alanini hizli anlamasini saglamak
- Tekrarli review, yetki hatasi, performans ve istatistik regresyon riskini azaltmak

## 1) Paketin Amaci ve Sinirlari

`review` paketi, tamamlanmis siparis kalemi uzerinden kullanici degerlendirmesi olusturma ve review istatistiklerini sunma sorumlulugunu tasir.

Kapsam:
- Review olusturma (`create`)
- Kullanici/listing bazli review listeleme
- Kullanici ve listing review istatistikleri
- Order item bazli review varligi ve toplu review sorgusu

Kapsam disi:
- Siparis teslimat karari ve shipping state yonetimi (`order`)
- Listing ana domain karar ve yayin akisi (`listing`)
- Genel bildirim altyapisi (`notification`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/ReviewController.java`
  - HTTP giris noktasi.
  - Review create ve orderItemIds bazli toplu review sorgusu.

- `application/ReviewService.java`
  - Ana is mantigi orkestrasyonu.
  - Review create, listeleme, istatistik ve cache key yonetimi.
  - Bildirim tetikleme (create sonrasi).

- `application/IReviewService.java`
  - Service kontrati.

- `repository/ReviewRepository.java`
  - Review kalicilik ve istatistik sorgulari.
  - `EntityGraph` ile reviewer/reviewed/orderItem/listing preload.
  - Projection tabanli aggregate sorgular.

- `repository/projection/*`
  - `ReviewStatsProjection`, `ListingReviewStatsProjection`.

- `validator/ReviewValidator.java`
  - Create oncesi yetki ve teslimat dogrulamasi.

- `mapper/ReviewMapper.java`
  - Request -> Entity, Entity/Projection -> DTO donusumleri.

- `entity/Review.java`
  - Review aggregate modeli.

- `dto/*`
  - `CreateReviewRequest`, `ReviewDto`, `ReviewStatsDto`, `UserReviewStatsDto`.

- `util/ReviewErrorCodes.java`
  - Modul hata kodlari ve HTTP semantigi.

## 3) Katmanlar Arasi Standart Akis

Standart akis:
1. `Controller` request alir ve parse/limit kontrollerini yapar.
2. `Service` kullanici, orderItem ve business rule orkestrasyonunu calistirir.
3. `Validator` review olusturma uygunlugunu dogrular.
4. `Repository` yazma/sorgu yapar.
5. `Mapper` DTO donusumunu tamamlar.
6. Gerekirse bildirim servisi cagrilir.

Prensipler:
- Yetki/teslimat kurali validator/service katmaninda kalir.
- Istatistik sorgulari projection ile alinip mapper'da DTO'ya donusturulur.
- Listeleme akislarinda relation preload semantigi repository'de kontrol edilir.

## 4) Ana Is Akislari

### 4.1 Review Create
1. Reviewer kullanicisi bulunur.
2. `orderItem` yuklenir.
3. `ReviewValidator.validateForCreate` ile kurallar kontrol edilir:
   - order item kullaniciya ait olmali
   - siparis shipping status `DELIVERED` olmali
4. Review entity olusturulur ve kaydedilir.
5. Unique ihlalde `REVIEW_ALREADY_EXISTS` donulur.
6. Bildirim olusturma/gonderme denenir; bildirim hatasi review kaydini geri almaz.

### 4.2 Review Listeleme
- Kullaniciya gelen reviewler: `findByReviewedUserIdOrderByCreatedAtDesc`
- Kullanicinin yazdigi reviewler: `findByReviewerIdOrderByCreatedAtDesc`
- Listing reviewleri: `findReviewsByListingId`

### 4.3 Order Item Bazli Sorgular
- Tek order item icin review: `findByReviewerIdAndOrderItemId`
- Toplu order item icin review: `findByOrderItem_IdInAndReviewer_Id`
- Controller tarafinda `orderItemIds` parse, bosluk/format/limit (`MAX_ORDER_ITEM_IDS`) kontrolu yapilir.

### 4.4 Istatistik Akisi
- Kullanici istatistigi: `getUserReviewStats(userId)` projection sorgusu.
- Listing istatistigi: `getListingReviewStats(listingIds)` projection sorgusu + `ReviewStatsDto.empty()` fallback.
- Toplu listing stats sonucu `reviewStatsBatch` cache'lenir; create sonrasinda cache temizlenir.

## 5) Konfigurasyon ve Sabitler

Aktif sabitler:
- `ReviewController.MAX_ORDER_ITEM_IDS`
- Cache adi: `reviewStatsBatch` (service anotasyonlari)

Kural:
- Yeni magic number ekleme.
- Operasyonel veya limit degerlerini konfigurasyon/sabit sinifina tasi.

## 6) Performans ve Davranissal Risk Notlari

- `EntityGraph` sayesinde mapper icindeki relation erisimlerinde N+1 riski azaltilir.
- Listing stats cache key'i siralanmis/dedup id listesiyle olusturulur; cache carpismasi riski dusurulur.
- Review create'te unique ihlal yakalaniyor; bu davranis DB constraint ile hizali kalmali.
- Bildirim adimi best-effort; review kaydi ile ayni kritiklikte ele alinmaz.

## 7) Bir Degisiklik Yapacaginda Ne Yapacaksin?

### A) Review olusturma kurali degistirmek
1. Kuralin validator mi service mi oldugunu netlestir.
2. `ReviewValidator` ve gerekiyorsa `ReviewService.createReview` akisini birlikte guncelle.
3. Hata kodunu `ReviewErrorCodes` ile tutarli sec.
4. Unique/teslimat/yetki davranisini bozmadigini kontrol et.

### B) Yeni istatistik alani eklemek
1. Projection arayuzlerini (`ReviewStatsProjection`, `ListingReviewStatsProjection`) guncelle.
2. Repository aggregate query'lerini yeni alanla hizala.
3. `ReviewStatsDto` ve `ReviewMapper.mapToReviewStatsDto` guncelle.
4. Cache invalidation ihtiyacini tekrar degerlendir.

### C) Yeni endpoint eklemek
1. `ReviewController` endpoint imzasini ekle.
2. Is mantigini `ReviewService`e tasi.
3. Gerekirse repository metodu + mapper + dto'yu birlikte guncelle.
4. Parametre parse/limit korumalarini atlama.

## 8) Yeni Ozellik Eklerken Hizli Runbook

1. Ozelligin akis tipini belirle: create, query, stats, batch-query.
2. Etki haritasi cikar:
   - API kontrati
   - Service/validator kurali
   - Repository/projection sorgusu
   - DTO/mapper donusumu
3. Review create etkisinde zorunlu kontroller:
   - ownership
   - delivered status
   - duplicate review korumasi
4. Stats degisikliginde cache semantigini kontrol et:
   - key
   - eviction
   - empty fallback
5. Davranissal test oncelikleri:
   - duplicate create (concurrency dahil)
   - delivered olmayan sipariste create engeli
   - orderItemIds parse/limit hatalari
   - stats cache hit/miss ve eviction

## 9) AI Ajanlari Icin Kisa Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. `Controller -> Service -> Validator -> Repository/Projection -> Mapper` zincirini izle.
2. Query/projection degisiyorsa DTO ve mapper'i ayni degisiklikte hizala.
3. Yeni hata durumunda hardcoded mesaj yerine `ReviewErrorCodes` kullan.
4. Stats degisikliklerinde cache davranisini zorunlu kontrol et.
