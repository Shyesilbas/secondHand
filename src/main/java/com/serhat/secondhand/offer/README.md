# Offer Paketi Teknik Rehber

Bu dokumanin amaci:
- `offer` paketinin sorumluluklarini hizli ve net anlatmak
- Insan ve AI gelistiricilerin degisiklik etkisini dogru yerde yonetmesini saglamak
- Performans, tutarlilik ve davranissal regresyon risklerini azaltmak

## 1) Paketin Amaci ve Sinirlari

`offer` paketi, listing uzerinden teklif olusturma ve teklif yasam dongusu yonetiminden sorumludur.

Kapsam:
- Offer olusturma, listeleme, detay okuma
- Offer aksiyonlari: `accept`, `reject`, `counter`
- Offer expiration ve scheduler ile otomatik expire
- Offer lifecycle bildirim e-postalari

Kapsam disi:
- Listing ana yonetimi (`listing` paketi)
- Odeme/siparisin kendi domain kurallari (`order`, `payment`)
- Kimlik dogrulama/yetkilendirme altyapisi (`auth`, `security`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/OfferController.java`
  - HTTP giris noktasi.
  - `create`, `getById`, `accept`, `reject`, `counter` endpointleri.

- `application/OfferService.java`
  - Ana is kurali orkestrasyonu.
  - User ve offer ulasilabilirlik kontrolu.
  - Expire kontrolu, pending kontrolu, receiver bazli aksiyon yetkisi.
  - `accept` akisinda listing lock ile concurrency riski azaltma.

- `application/IOfferService.java`
  - Service kontrati.

- `repository/OfferRepository.java`
  - Persistence sorgulari.
  - Liste endpointlerinde `@EntityGraph` ile relation preload.
  - Expire scheduler sorgusu.

- `validator/OfferValidator.java`
  - Create/counter request validasyonu.
  - Listing uygunlugu ve actor/receiver kontrolleri.

- `mapper/OfferMapper.java`
  - Request -> Entity ve Entity -> DTO donusumu.
  - Expiration tarihini `OfferConfigProperties` uzerinden merkezi uretir.

- `entity/Offer.java`
  - Offer aggregate entity.
  - Status, actor, parent offer zinciri.
  - Sorgu odakli index tanimlari.

- `entity/OfferStatus.java`, `entity/OfferActor.java`
  - Durum ve actor enumlari.

- `scheduler/OfferScheduler.java`
  - Pending ve suresi dolmus offer kayitlarini `EXPIRED` yapar.

- `email/OfferEmailNotificationService.java`, `email/OfferEmailTemplateService.java`
  - Offer olaylarinda bildirim e-postasi uretimi/gonderimi.

- `dto/*`
  - `CreateOfferRequest`, `CounterOfferRequest`, `OfferDto`.

- `config/OfferConfigProperties.java`
  - `app.offer.*` konfigurasyon bind noktasi.

- `util/OfferErrorCodes.java`
  - Modul hata kodlari ve HTTP status semantigi.

## 3) Standart Akis ve Karar Noktalari

Genel akis:
1. `Controller` request alir ve service'e delege eder.
2. `Service` business rule + authorization semantigini uygular.
3. `Validator` domain kurallarini dogrular.
4. `Repository` sorgu/yazma yapar.
5. `Mapper` DTO donusumu yapar.

Karar noktasi prensipleri:
- Yetki ve aksiyon semantigi service/validator'da kalir.
- Repository sadece data access sorumlulugu tasir.
- Mapper yeni relation erisimi eklediginde N+1 etkisi yeniden degerlendirilir.

## 4) Ana Is Akislari

### 4.1 Create Offer
1. Buyer bulunur.
2. Request validasyonu yapilir (quantity/price).
3. Listing yuklenir ve offer'a uygunluk kontrol edilir.
4. Offer maplenir, kaydedilir, bildirim tetiklenir.

### 4.2 List Made / List Received
1. Repository sayfali sorgu cagirir.
2. `@EntityGraph` ile gerekli relationlar preload edilir.
3. Sonuc `OfferDto`'ya maplenir.

Not:
- Bu endpointlerde fetch stratejisi degisirse page davranisi ve query maliyeti tekrar olculmelidir.

### 4.3 Accept
1. Aksiyon kullanicisi ve offer bulunur.
2. Receiver kontrolu + pending + expiration kontrolu yapilir.
3. Listing locklanir (`findByIdWithLock`) ve tekrar accepted var mi kontrol edilir.
4. Offer `ACCEPTED` yapilir, kaydedilir, bildirim gonderilir.

### 4.4 Reject
1. Receiver kontrolu + pending + expiration kontrolu.
2. Offer `REJECTED` yapilir.
3. Bildirim gonderilir.

### 4.5 Counter
1. Counter request validasyonu (dogru error code propagate edilir).
2. Onceki offer receiver tarafindan dogrulanir.
3. Onceki offer `REJECTED` edilir.
4. Yeni pending counter offer olusturulur (`parentOffer` zinciri korunur).

### 4.6 Expiration Scheduler
1. Pending ve suresi dolan offerlar cekilir.
2. Status `EXPIRED` yapilir.
3. Ilgili bildirimler gonderilir.

## 5) Konfigurasyon

`application.yml`:
- `app.offer.expiration-hours`
- `app.offer.scheduler-cron`

Kural:
- Yeni magic number ekleme.
- Operasyonel tuning gerektiren degerleri `OfferConfigProperties` altina tasi.

## 6) Performans ve Risk Notlari

- Liste endpointleri: `@EntityGraph` kullanimi page+fetch join kaynakli count/query riskini azaltir.
- Concurrency: `accept` akisinda listing lock + tekrar accepted kontrolu bulunur.
- Indexler: `status,expires_at`, `buyer_id`, `seller_id`, `listing_id` sorgu maliyetini dusurmek icin tanimlidir.
- Counter zinciri buyudukce listeleme maliyeti artabilir; projection ihtiyaci dogarsa repository katmaninda cozulmelidir.

## 7) Bir Degisiklik Yapacaginda Ne Yapacaksin?

### A) Mevcut davranisi degistirmek
1. Etkilenen akis noktasini sec: `create`, `accept`, `reject`, `counter`, `scheduler`.
2. Once `OfferService` ve `OfferValidator` uzerinden kurali guncelle.
3. DTO kontrati degisiyorsa `dto/*` + `OfferMapper` birlikte guncelle.
4. Query degisiyorsa `OfferRepository` performans etkisini kontrol et.
5. Hata semantigi degisiyorsa `OfferErrorCodes` ile tutarli kal.

### B) Yeni alan eklemek (entity/DTO)
1. `Offer` entity alanini ekle; gerekiyorsa index/kolon ozelligi tanimla.
2. Request/response DTO'lari guncelle.
3. `OfferMapper` maplerini cift yonlu guncelle.
4. Validasyon gerekiyorsa `OfferValidator`a ekle.
5. Gerekirse scheduler veya email akisini yeni alana gore revize et.

### C) Yeni endpoint eklemek
1. `OfferController` endpoint imzasini ekle.
2. Is mantigini `OfferService`e tasi.
3. Gerekirse repository metodu + mapper + error code birlikte ekle.
4. Receiver/buyer/seller yetki semantigini netlestir.

## 8) Yeni Ozellik Eklerken Hizli Runbook

1. Ozelligin hangi yasam adimina ait oldugunu belirle (`create/list/action/scheduler`).
2. Once mevcut akisla cakisma var mi kontrol et:
   - pending zorunlulugu
   - expiration etkisi
   - receiver/actor yetkisi
   - email bildirimi gereksinimi
3. Kontratlari tek seferde hizala:
   - API (`Controller` + DTO)
   - Domain (`Service` + `Validator`)
   - Persistence (`Repository` + `Entity`)
4. Konfigurasyon ihtiyaci varsa `OfferConfigProperties` altina ekle.
5. Davranissal risk kontrolu yap:
   - Concurrency (ozellikle `accept` benzeri state degisimi)
   - N+1 veya page query bozulmasi
   - Error code uyumu
6. Test kapsami:
   - Ozellikle `accept` race, `counter` zinciri, `scheduler expiry` icin test ekle.
   - Paket altinda test yoksa en az bu 3 akisla basla.

## 9) AI Ajanlari Icin Kisa Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. Once `Controller -> Service -> Validator -> Repository -> Mapper -> Entity` zincirini izle.
2. Is kurali degisikligini sadece controller'da birakma.
3. Query degisiyorsa liste endpointlerinde page davranisini koru.
4. Magic deger ekleme; konfigurasyonla yonet.
5. Error code standardini `OfferErrorCodes` uzerinden koru.
