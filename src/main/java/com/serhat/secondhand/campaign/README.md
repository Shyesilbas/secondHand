# Campaign Paketi Teknik Rehber

Bu dokumanin amaci:
- `campaign` paketinin sorumluluklarini tek yerde netlestirmek
- Insan ve AI gelistiricilerin degisiklik yaparken etki alanini hizli anlamasini saglamak
- Performans (N+1, row explosion), tutarlilik ve regresyon risklerini azaltmak

## 1) Paketin Amaci ve Sinirlari

`campaign` paketi, saticinin kampanya olusturma/guncelleme/silme/listeleme akislarini ve kampanya uygunluk kurallarini yonetir.

Kapsam:
- Seller campaign CRUD
- Campaign validasyon kurallari (deger, tarih, listing tipi, sahiplik)
- Aktif kampanyalarin seller bazli yuklenmesi
- Expired kampanyalarin scheduler ile pasife alinmasi

Kapsam disi:
- Fiyat hesaplama motorunun tamamı (`pricing` tarafi campaign bilgisini tuketir)
- Listing ana is akisi (`listing` paketi)
- Kimlik dogrulama/yetkilendirme (`auth`, `security`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/CampaignController.java`
  - HTTP giris noktasi.
  - `create`, `update`, `delete`, `list` endpointleri.
  - Sayfalama boyutunu `CampaignConfigProperties` uzerinden alir.

- `application/ICampaignService.java`
  - Service kontrati.

- `application/CampaignService.java`
  - Ana is mantigi.
  - Seller yukleme + sahiplik kontrol zinciri.
  - Listeleme projection akisi.
  - Aktif kampanya yuklemede iki adimli collection hydration.

- `application/CampaignScheduler.java`
  - Expired kampanyalari periyodik pasife alir.
  - Etkilenen satir sayisini loglar.

- `validator/CampaignValidator.java`
  - Is kurallari:
    - Name/discount/value temel validasyon
    - Tarih tutarliligi
    - Tip kisitlari (`REAL_ESTATE`, `VEHICLE` kampanyaya kapali)
    - Eligible listing varlik + sahiplik kontrolu

- `repository/CampaignRepository.java`
  - Persistence sorgulari.
  - Listeleme icin `CampaignListProjection`.
  - Aktif kampanya cekimi + collection projection sorgulari.
  - Scheduler icin bulk update.

- `repository/projection/*`
  - `CampaignListProjection`: listing endpointi icin hafif projection
  - `CampaignEligibleTypeProjection`: campaignId + listingType
  - `CampaignEligibleListingProjection`: campaignId + listingId

- `mapper/CampaignMapper.java`
  - Entity -> DTO ve projection -> DTO donusumleri.
  - Request -> entity donusumu ve update apply.

- `entity/Campaign.java`
  - Campaign aggregate entity.
  - `eligibleTypes`, `eligibleListingIds` element collection alanlari.
  - Sorgu desenlerine gore index tanimlari.

- `entity/CampaignDiscountKind.java`
  - `PERCENT`, `FIXED`.

- `dto/*`
  - `CreateCampaignRequest`, `UpdateCampaignRequest`, `CampaignDto`.
  - Request DTO seviyesinde temel Bean Validation kurallari.

- `config/CampaignConfigProperties.java`
  - `app.campaign.*` konfigurasyonlarinin bind noktasi.

- `util/CampaignErrorCodes.java`
  - Modul hata kodlari ve HTTP status semantigi.

## 3) Katmanlar Arasi Standart Akis

Standart akis:
1. `Controller` request alir ve service'e delege eder.
2. `Service` business rule + ownership + orchestration yapar.
3. `Validator` domain kurallarini uygular.
4. `Repository` sorgu/guncelleme yapar.
5. `Mapper` DTO donusumu yapar.

Prensipler:
- Rule service/validator katmaninda kalir.
- Repository sadece data access sorumlulugu tasir.
- Mapper tarafinda LAZY relation tetikleyip N+1 uretmeyecek sekilde tasarim yapilir.

## 4) Ana Is Akislari

### 4.1 Campaign create
1. `CampaignController.create`
2. `CampaignService.create`
3. Seller bulunur (`findSellerById`)
4. Request entity'ye maplenir
5. `CampaignValidator.validate`
6. Save + DTO donus

### 4.2 Campaign update
1. `CampaignController.update`
2. `CampaignService.update`
3. Seller bulunur
4. Campaign bulunur + sahiplik dogrulanir (`findOwnedCampaign`)
5. Request alanlari apply edilir
6. Validator tekrar calisir
7. Save + DTO donus

### 4.3 Campaign delete
1. `CampaignController.delete`
2. Seller bulunur
3. Campaign bulunur + sahiplik dogrulanir
4. Delete

### 4.4 Seller campaign listesi
1. `CampaignController.list`
2. Boyut degeri query param veya config default
3. `CampaignService.listMyCampaigns`
4. `CampaignRepository.findPageSummaryBySellerId` projection query
5. Projection -> DTO map

Not:
- Bu akista collection alanlari lazily tetiklenmez; N+1 riski bu endpointte engellenmistir.

### 4.5 Aktif campaign yukleme (pricing tuketimi)
1. `CampaignService.loadActiveCampaignsForSellers`
2. `findAllActiveBySellerIds` ile campaign listesi cekilir
3. `hydrateEligibleCollections`:
   - `findEligibleTypesByCampaignIds`
   - `findEligibleListingIdsByCampaignIds`
4. Sonucta campaign objeleri collectionlari ile doldurulmus halde dondurulur

Not:
- Cift collection `fetch join` bilincli olarak kullanilmiyor.
- Bu yaklasim row explosion riskini azaltir.

### 4.6 Scheduler: expired kampanyalari pasife alma
1. `CampaignScheduler.deactivateExpiredCampaigns`
2. `deactivateAllExpired(now)` bulk update
3. Etkilenen satir sayisi > 0 ise loglanir

## 5) Kritik Is Kurallari

- Campaign name bos olamaz.
- `discountKind` ve `value` zorunludur.
- `value > 0` olmalidir.
- `discountKind = PERCENT` ise `value <= 100` olmalidir.
- `startsAt > endsAt` olamaz.
- `endsAt` gecmiste olamaz.
- `eligibleTypes` icinde `REAL_ESTATE` veya `VEHICLE` olamaz.
- `eligibleListingIds` verildiyse:
  - Tum id'ler var olmalidir.
  - Tum listing'ler current seller'a ait olmalidir.
  - Yasak tipte listing icermemelidir.

## 6) Endpoint Haritasi

Taban yol: `/api/v1/seller/campaigns`

- `POST /`
  - Body: `CreateCampaignRequest`
  - Sonuc: `Result<CampaignDto>`

- `PUT /{id}`
  - Body: `UpdateCampaignRequest`
  - Sonuc: `Result<CampaignDto>`

- `DELETE /{id}`
  - Sonuc: `Result<Void>`

- `GET /?page=&size=`
  - Sonuc: `Page<CampaignDto>`
  - Sort: `createdAt DESC`
  - `size` yoksa `app.campaign.list-default-size` kullanilir

## 7) Konfigurasyon ve Sabitler

`application.yml`:
- `app.campaign.list-default-size`
- `app.campaign.scheduler-deactivate-fixed-delay-ms`

Binding:
- `CampaignConfigProperties`

Kural:
- Yeni magic number ekleme.
- Operasyonel tuning ihtiyaci olan tum degerleri config'e tasi.

## 8) Performans Notlari

- Liste endpointi projection tabanli; entity collection alanlari maplenmedigi icin N+1 riski dusuktur.
- Aktif campaign cekiminde cift collection fetch join yok; row explosion riski azaltilmistir.
- Validator tarafinda ownership kontrolu entity gezmeden count/exists sorgulari ile yapilir.
- `Campaign` entity indeksleri:
  - `seller_id, created_at`
  - `active, ends_at`
  - `seller_id, active, starts_at, ends_at`

## 9) Tutarlilik ve Hata Yonetimi

- Modul ici hatalarda `CampaignErrorCodes` kullan.
- Service katmaninda farkli exception turleri dagitmak yerine `Result` semantigini koru.
- Yeni hata durumu eklerken:
  1. `CampaignErrorCodes` icine ekle
  2. Service/validator tarafinda bu kodu don
  3. Controller tarafinda hardcoded message/response yazma

## 10) Siklikla Yapilan Degisiklikler (Ne Yapacagim?)

### A) Yeni campaign alani eklemek
1. `Campaign` entity alanini ekle
2. Gerekirse index/kolon ozelliklerini guncelle
3. `CreateCampaignRequest`, `UpdateCampaignRequest`, `CampaignDto` guncelle
4. `CampaignMapper` donusumlerini guncelle
5. Validator kurallarina etkisini degerlendir
6. Repository projectionlari etkileniyorsa guncelle

### B) Yeni discount tipi eklemek
1. `CampaignDiscountKind` enum'a ekle
2. `CampaignValidator.validateBasics` kuralini guncelle
3. Pricing tarafindaki uygulama mantigi ile uyumlulugu kontrol et
4. API kontratini (`dto`) kontrol et

### C) Liste endpointi alanlarini degistirmek
1. `CampaignListProjection` guncelle
2. `CampaignRepository.findPageSummaryBySellerId` query aliaslarini guncelle
3. `CampaignMapper.toDto(CampaignListProjection)` guncelle
4. N+1 uretmeyecek sekilde kalmaya dikkat et

### D) Aktif campaign yukleme davranisini degistirmek
1. `findAllActiveBySellerIds` filtresini guncelle
2. `hydrateEligibleCollections` adimlarini uyumlu tut
3. Cift collection fetch join'e geri donme
4. Buyuk seller setleri icin sorgu maliyetini gozden gecir

### E) Scheduler periyodunu veya davranisini degistirmek
1. `app.campaign.scheduler-deactivate-fixed-delay-ms` degerini guncelle
2. `deactivateAllExpired` query semantigini koru
3. Log sinyallerinin yeterli oldugunu kontrol et

### F) Yeni endpoint eklemek
1. Controller imzasini ekle
2. Is mantigini service'e tasi
3. Gerekliyse validator/repository/mapper/dto beraber guncelle
4. Ownership ve authorization etkisini netlestir

## 11) AI Ajanlari Icin Hizli Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. Once `Controller -> Service -> Validator -> Repository -> Mapper -> Entity` zincirini takip et.
2. Repository imzasi degisirse tum cagrilan katmanlari ayni turda guncelle.
3. Listeleme degisikliklerinde projection tabanli yapiyi bozmadan ilerle.
4. Collection alanlari icin mapper/serialization kaynakli lazy tetiklemeyi kontrol et.
5. Performans degisikliginde cift collection fetch join kullanma.
6. Config'e alinmasi gereken sabitleri kod icinde birakma.

## 12) Kod Inceleme Kontrol Listesi

PR acmadan once:
- Endpoint kontratlari (`dto`) guncel mi?
- Validator kurallari yeni davranisi kapsiyor mu?
- Ownership kurali korunuyor mu?
- Projection query aliaslari interface ile birebir uyumlu mu?
- Scheduler degisikligi varsa config ve log semantigi korunuyor mu?
- N+1 veya row explosion riski geri gelmis mi?

## 13) Bilinen Riskler ve Dikkat Noktalari

- `CampaignDto` halen `eligibleTypes` ve `eligibleListingIds` alanlarini tasiyor.
  - Liste endpointinde bu alanlar bos set doner.
  - Detay endpointi eklenirse bu alanlarin dolu versiyonu orada dondurulmelidir.
- Buyuk seller listelerinde `IN` sorgulari DB tarafinda maliyetli olabilir.
  - Gerekirse batch partition veya temp table stratejisi dusunulmelidir.
- Bean Validation kurallari temel seviyededir.
  - Alanlar arasi kosullu validasyon ihtiyaci buyurse custom validator eklenmelidir.

## 14) Kisa Degisiklik Matrisi

- Is kurali degisti -> `validator` + `dto` + `error codes`
- Sorgu degisti -> `repository` + `service` + performans kontrolu
- Response degisti -> `dto` + `mapper` + projection/query alias
- Zamanlama/sabit degisti -> `config properties` + `application.yml`

Bu rehber, campaign paketinde degisiklik yaparken hem hizli onboarding hem guvenli refactor icin referans dokumandir.

## 15) Mini Runbook (Operasyon + Hizli Mudahale)

Bu bolum, sorun aninda "neye bakacagim, nasil duzeltecegim" sorusuna kisa cevap verir.

### 15.1 Belirti: `GET /api/v1/seller/campaigns` yavas

Kontrol:
- Liste endpointinin projection akisini kullandigini dogrula:
  - `CampaignRepository.findPageSummaryBySellerId`
  - `CampaignMapper.toDto(CampaignListProjection)`
- Son degisiklikte listelemeye collection erisimi eklendi mi kontrol et.

Mudahale:
1. Entity tabanli listeleme varsa projection tabanina geri don.
2. Mapper icinde `eligibleTypes` / `eligibleListingIds` lazy tetikleyen erisimleri kaldir.
3. `Campaign` indexlerinin korunup korunmadigini kontrol et.

### 15.2 Belirti: Aktif campaign yukleme (pricing akisi) yavas

Kontrol:
- `CampaignService.loadActiveCampaignsForSellers` icinde iki asamali hydration calisiyor mu?
- Repository tarafinda cift collection `fetch join` geri gelmis mi?

Mudahale:
1. Ana query'yi sade tut (`findAllActiveBySellerIds`).
2. Collectionlari projection sorgulariyla ayri cek (`findEligibleTypesByCampaignIds`, `findEligibleListingIdsByCampaignIds`).
3. Buyuk `sellerIds` listelerinde gerekiyorsa batch partition uygula.

### 15.3 Belirti: Create/Update beklenmeyen sekilde `CAMPAIGN_INVALID`

Kontrol:
- `CampaignValidator.validateBasics` kurallari:
  - `value > 0`
  - `%` ise `value <= 100`
- DTO bean validation kurallari degisti mi?

Mudahale:
1. Is kurali degisti ise hem DTO hem validator'i birlikte guncelle.
2. Sadece bir katmani degistirip digerini eski birakma.
3. Hata semantigi gerekiyorsa `CampaignErrorCodes` ile netlestir.

### 15.4 Belirti: `CAMPAIGN_NOT_OWNED` artisi

Kontrol:
- `eligibleListingIds` girdisi dogru seller'a mi ait?
- `ListingRepository` count tabanli metotlar beklenen sonucu donuyor mu?

Mudahale:
1. Request'te yanlis listing id seti varsa istemciyi duzelt.
2. Repository imzasi degisti ise validator cagrilarini esitlestir.
3. Ownership kontrolunu entity loop ile degil count/exists ile tut.

### 15.5 Belirti: Expired campaignler pasife dusmuyor

Kontrol:
- `app.campaign.scheduler-deactivate-fixed-delay-ms` degeri uygun mu?
- Scheduler logunda "Deactivated X expired campaigns" sinyali var mi?
- `endsAt` verileri timezone/format acisindan tutarli mi?

Mudahale:
1. Konfigurasyon degerini ortama uygun ayarla.
2. `deactivateAllExpired(now)` query semantigini koru.
3. Gecici izleme icin log seviyesini arttir, kalici cozumde eski seviyeye cek.

### 15.6 Hata Aninda Guvenli Degisiklik Sirasi

1. Once semptomu endpoint veya scheduler bazinda siniflandir.
2. Ilgili zinciri takip et:
   - API sorunu: `Controller -> Service -> Validator -> Repository -> Mapper`
   - Scheduler sorunu: `Scheduler -> Repository -> Config`
3. Tek noktaya degil, etkilenen katmanlara birlikte dokun.
4. Performans degisikliklerinde:
   - N+1 kontrolu
   - Row explosion kontrolu
   - Index etkisi
5. Son adimda README ve config dokumani guncel birak.

