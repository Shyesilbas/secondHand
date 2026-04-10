# FavoriteList Paketi Teknik Rehber

Bu dokumanin amaci:
- Paketin sorumluluklarini tek yerde netlestirmek
- Degisiklik yaparken dogru dosyayi secmeyi kolaylastirmak
- Performans, N+1, race condition ve davranissal regressions risklerini azaltmak

## 1) Paketin Amaci ve Sinirlari

`favoritelist` paketi, kullanicilarin listing koleksiyonlari olusturmasini ve yonetmesini saglar.

Kapsam:
- Liste olusturma, guncelleme, silme
- Listeye item ekleme/cikarma
- Liste begenme/begeni kaldirma
- Liste detay ve summary donusleri
- Populer/public listelerin listelenmesi

Kapsam disi:
- Listing olusturma/guncelleme kurallari (`listing` paketi)
- Kullanici kimlik dogrulama (`user/security` akisi)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/FavoriteListController.java`
  - HTTP giris noktasi.
  - Parametre cozumler, `Pageable` olusturur, service'e delegasyon yapar.

- `application/FavoriteListService.java`
  - Is kurallari ve orkestrasyon katmani.
  - Transaction sinirlari burada.
  - Repository + mapper + user/listing entegrasyonunu yonetir.

- `repository/FavoriteListRepository.java`
  - Liste ve summary sorgulari.
  - Summary endpointleri projection tabanli aggregate query kullanir.

- `repository/FavoriteListItemRepository.java`
  - Liste-item iliskisi sorgulari.
  - Limit kontrolu icin count queryleri burada.

- `repository/FavoriteListLikeRepository.java`
  - Liste-like iliskisi sorgulari.
  - Like var/yok kontrolleri burada.

- `repository/projection/FavoriteListSummaryProjection.java`
  - Summary endpointlerinin DB projection kontrati.
  - Mapper bu projection'dan DTO uretir.

- `mapper/FavoriteListMapper.java`
  - Entity/projection -> DTO donusumleri.
  - Summary projection mapleme ve varsayilan degerler burada.

- `entity/FavoriteList.java`
  - Ana liste modeli.
  - `items` ve `likes` iliskileri lazy tutulur.

- `entity/FavoriteListItem.java`
  - Liste ile listing iliskisi.
  - Unique constraint: bir listing ayni listeye bir kez eklenir.

- `entity/FavoriteListLike.java`
  - Liste begeni iliskisi.
  - Unique constraint: bir kullanici ayni listeyi bir kez begenir.

- `dto/*`
  - Request/response modelleri.
  - API kontratini temsil eder.

- `config/FavoriteListConfig.java`
  - Boyut ve limit gibi konfigurasyon degerleri.
  - `application.yml` altinda `app.favorite-list.*`.

- `util/FavoriteListErrorCodes.java`
  - Error code sabitleri.
  - Service katmaninda hardcoded kod daginikligini engeller.

## 3) Katmanlar Arasi Akis

Standart akis:
1. `Controller` request'i alir ve normalize eder.
2. `Service` is kurallarini uygular.
3. `Repository` veri operasyonunu yapar.
4. `Mapper` DTO donusumunu tamamlar.
5. `Controller` response dondurur.

Detay endpoint akisi (`GET /api/favorite-lists/{listId}`):
- `findByIdWithDetails` ile detay veri cekilir
- erisim/visibility kontrolu yapilir
- `toDto` ile tam detay DTO doner

Summary endpoint akisi (`/my`, `/user/{id}`, `/popular`):
- projection tabanli aggregate query calisir
- mapper `toSummaryDto(projection)` ile query sonucunu DTO'ya cevirir
- collection lazy load etmeden sayilar/total hesap doner

## 4) Kritik Is Kurallari

- Kullanici basina max liste limiti vardir (`maxListsPerUser`).
- Liste basina max item limiti vardir (`maxItemsPerList`).
- Ayni isimde liste olusturma/guncelleme engellenir.
- Private liste baskasi tarafindan gorulemez.
- Kullanici private listeyi begenemez.
- Kullanici kendi listesini begenemez.
- Ayni item ayni listeye ikinci kez eklenemez.
- Ayni kullanici ayni listeyi ikinci kez begenemez.

## 5) Performans ve Veri Tutarliligi Notlari

- Summary endpointlerde collection fetch join + pagination kullanilmaz.
  - Sebep: cartesian patlama, yanlis satir seti, memory baskisi.
- Popular siralama `SIZE(collection)` yerine aggregate count ile yapilir.
- Item limit kontrolu `collection.size()` yerine DB `count` ile yapilir.
- Save oncesi `exists` kontrolu olsa bile DB unique constraint ana guvencedir.
  - `DataIntegrityViolationException` yakalanip tutarli domain hatasina maplenir.

## 6) Konfigurasyon Haritasi

`application.yml`:
- `app.favorite-list.my-lists-default-size`
- `app.favorite-list.user-public-lists-default-size`
- `app.favorite-list.popular-default-size`
- `app.favorite-list.max-lists-per-user`
- `app.favorite-list.max-items-per-list`

Kurallar:
- Yeni magic number ekleme.
- Yeni limit/default gerekiyorsa once `FavoriteListConfig` + `application.yml` ekle.

## 7) Endpoint Haritasi

Taban yol: `/api/favorite-lists`

- `POST /` -> liste olustur
- `GET /my` -> kullanicinin listeleri (summary + page)
- `GET /user/{userId}` -> kullanicinin public listeleri
- `GET /popular` -> populer public listeler
- `GET /{listId}` -> liste detay
- `PUT /{listId}` -> liste guncelle
- `DELETE /{listId}` -> liste sil
- `POST /{listId}/items` -> listeye item ekle
- `DELETE /{listId}/items/{listingId}` -> listeden item cikar
- `POST /{listId}/like` -> listeyi begen
- `DELETE /{listId}/like` -> begeniyi kaldir
- `GET /listing/{listingId}/lists` -> kullanicida bu listing'i iceren listelerin id'leri

## 8) Siklikla Yapilan Degisiklikler ve Yol Haritasi

### A) Yeni bir summary alan eklemek (ornek: averagePrice)
1. `FavoriteListSummaryProjection` alanini ekle.
2. `FavoriteListRepository` aggregate querylerine alan hesaplamasini ekle.
3. `FavoriteListSummaryDto` alanini ekle.
4. `FavoriteListMapper.toSummaryDto(projection)` maplemesini guncelle.
5. Endpoint response uyumunu ve null/default davranisini test et.

### B) Yeni bir is kurali eklemek
1. Kodunu `FavoriteListErrorCodes` icine ekle.
2. Kurali `FavoriteListService` uygun methoduna ekle.
3. Ayni kurali baska methodlarda tekrarlama; ortak private helper kullan.
4. Davranissal testleri guncelle.

### C) Yeni endpoint eklemek
1. `FavoriteListController` endpoint imzasini ekle.
2. Is mantigini `FavoriteListService` katmanina yaz.
3. Gerekirse repository query ekle (projection tercih et).
4. Mapper/DTO kontratini guncelle.
5. Pagination/default size gerekiyorsa config'e bagla.

### D) Performans iyilestirmesi yapmak
1. Once repository query planini incele.
2. N+1 riski var mi kontrol et (mapper'da lazy access dahil).
3. Gerekirse projection veya batch sorgu kullan.
4. Query degistiyse mapping ve response dogrulugunu tekrar test et.

## 9) Test Odak Noktalari

Minimum kontrol listesi:
- Liste olusturma limiti dogru calisiyor mu
- Ayni isim duplicate davranisi dogru mu
- Item ekleme limiti count bazli dogru mu
- Duplicate item ekleme conflict dogru mapleniyor mu
- Like/unlike race senaryosunda hata kodu tutarli mi
- Popular/my/user summary sayilari gercek veriyle uyumlu mu
- Private liste erisim kurali bozulmadi mi

## 10) AI Ajanlari Icin Hizli Protokol

Bu pakette otomatik degisiklik yapan ajanlar su sirayi izlemeli:
1. `Controller -> Service -> Repository -> Mapper -> DTO` sirasiyla oku.
2. Query imzasi degisirse tum cagrilan katmanlari birlikte guncelle.
3. Hardcoded error code yerine `FavoriteListErrorCodes` kullan.
4. Hardcoded limit/default yerine `FavoriteListConfig` kullan.
5. Summary endpointlerde entity collection uzerinden hesap yapma; projection kullan.
6. Yazma akislarda unique constraint ihlali icin deterministic hata davranisini koru.

## 11) Degisiklik Oncesi/ Sonrasi Kisa Checklist

Degisiklik oncesi:
- Hangi endpoint/akis etkilenecek netlestir
- Query tarafinda N+1 veya cartesian riskini not et
- DTO backward compatibility etkisini belirle

Degisiklik sonrasi:
- Compile al
- Ilgili endpoint response alanlarini manuel dogrula
- Error code ve status davranisini kontrol et
- Pagination + summary alanlari tutarliligini kontrol et

Bu rehber korunursa `favoritelist` paketi daha ongorulebilir, performansli ve bakimi kolay kalir.
