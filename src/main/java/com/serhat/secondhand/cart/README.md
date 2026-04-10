# Cart Modulu

Bu modul, kullanicinin sepete urun ekleme/guncelleme/silme akisini ve dusuk stokta gecici rezervasyon davranisini yonetir.

## Mimari Akis

- `api/CartController`: HTTP endpoint girisi, kimlik dogrulama principal'dan user alir.
- `application/CartService`: Is kurallari, stok/rezervasyon kontrolu, sepet yazma islemleri.
- `validator/CartValidator`: Listeleme ve rezervasyon uygunluk kurallari.
- `repository/CartRepository`: Sepet sorgulari, aktif rezervasyon toplamlari, batch temizlik sorgulari.
- `application/CartReservationScheduler`: Suresi dolan rezervasyonlari periyodik temizler.
- `mapper/CartMapper`: `Cart` -> `CartDto` donusumu.
- `config/CartConfig`: Modul bazli konfigurasyonlar.

## Kritik Is Kurallari

- Listeleme aktif olmali ve kullanicinin kendi ilani olmamali.
- Listeleme tipi kurala uygun olmali (izin verilmeyen tipler engellenir).
- Dusuk stok senaryosunda aktif rezervasyonlar da stok hesabina dahil edilir.
- Rezervasyon acik oldugunda, dusuk stok urunleri sepete eklerken `reservedAt` ve `reservationEndTime` atanir.
- Paralel add/update yazimlarinda olusan DB unique conflict, teknik hata yerine business error olarak doner.

## Konfigurasyon

`application.yml` altinda:

- `app.cart.reservation.enabled`
- `app.cart.reservation.timeout-minutes`
- `app.cart.defaults.quantity`
- `app.cart.scheduler.cleanup-fixed-rate-ms`
- `app.cart.zone-id`

Not: zone tek noktadan yonetilir; service/scheduler bu degeri kullanir.

## Degisiklik Yaparken Nereden Baslanir

- Endpoint davranisi degisecekse: `CartController` + `CartService`.
- Is kurali degisecekse: once `CartValidator`, sonra `CartService` entegrasyonu.
- Yeni sorgu gerekiyorsa: `CartRepository`e projection veya query ekle.
- DTO cevabi degisecekse: `CartDto` ve `CartMapper` birlikte guncellenmeli.
- Rezervasyon zamani/temizlik davranisi degisecekse: `CartConfig` + `CartReservationScheduler`.

## Yeni Ozellik Ekleme Runbook

1. **Kurali tanimla**
   - Is kurali ve hata kodunu netlestir.
   - Gerekirse `CartErrorCodes`a yeni kod ekle.

2. **Servis akisina entegre et**
   - `CartService` icinde tek sorumlulugu koru.
   - Validasyonlari `CartValidator`a tasiyip serviste orkestre et.

3. **Repository ihtiyacini belirle**
   - Yeni filtre/sayim gerekiyorsa repository query ekle.
   - N+1 riskini join fetch/projection ile kontrol et.

4. **Konfigurasyonlastir**
   - Magic number/string kullanma.
   - Ayarlanabilir degerleri `app.cart.*` altina tasi.

5. **Test et**
   - Paralel add/update cakisimi.
   - Dusuk stok + aktif rezervasyon kombinasyonu.
   - Rezervasyon timeout temizleme davranisi.
   - Notes alaninin null ile temizlenmesi.

## Bilinen Dikkat Noktalari

- `CartMapper` icindeki zaman donusumu zone bilgisini sabit kullaniyor; zone davranisi degisecekse mapper da guncellenmeli.
- `ReservationException` modulde sinirli kullanimda; yeni akista gereksizse kaldirma/deprecate degerlendir.
