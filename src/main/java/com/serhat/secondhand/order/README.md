# Order Paketi Teknik Rehber

Bu dokumanin amaci:
- `order` paketinin sinirlarini ve kritik akislarini tek yerde netlestirmek
- Insan ve AI gelistiricilerin degisiklik yaparken etki alanini hizli kavramasini saglamak
- Durum gecisi, escrow, iptal/iade ve event akislarinda regresyon riskini azaltmak

## 1) Paketin Amaci ve Sinirlari

`order` paketi, siparis yasam dongusunu yonetir: olusturma, durum ilerletme, tamamlama, iptal, iade ve escrow ile iliskili domain kararlarini verir.

Kapsam:
- Siparis olusturma ve siparis item modelleme
- Durum gecisi kurallari (policy tabanli)
- Scheduler ile otomatik ilerletme/tamamlama
- Manuel tamamlama, iptal ve iade akislarinin domain orkestrasyonu
- Siparis event yayini ve bildirim tetikleme noktasi

Kapsam disi:
- Odeme stratejisi ve para hareketi detay motoru (`payment`)
- Sepet/fiyat hesaplama kararlarinin ana kaynagi (`cart`, `pricing`)
- Kimlik dogrulama ve yetkilendirme altyapisi (`auth`, `security`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/OrderController.java`
  - HTTP giris noktasi.
  - Checkout sonrasi siparis sorgu/aksiyon endpointleri.

- `application/*`
  - `OrderCreationService`, `OrderQueryService`, `OrderModificationService`, `OrderValidationService`.
  - `OrderCompletionService`, `OrderCancellationService`, `OrderRefundService`.
  - `OrderCompletionScheduler` (otomatik durum ilerletme).
  - `event/*` ve `listener/*` (event publish/consume).

- `entity/*`
  - `Order`, `OrderItem`, `Shipping`, escrow ve iptal/iade kayitlari.
  - Durum setleri ve domain sabitlerinin bir kismi burada tanimli.

- `policy/*`
  - Gecis/iptal/iade/tamamlama uygunluk kurallari.
  - Is kurali degisikliginde ilk bakilacak yer.

- `repository/*`
  - Siparis, item, shipping, escrow ve kompanzasyon sorgulari.

- `mapper/*`
  - Entity -> DTO donusumleri (`OrderMapper`, `ShippingMapper`).

- `util/*`
  - `OrderErrorCodes`, `OrderBusinessConstants`.

## 3) Katmanlar Arasi Standart Akis

Standart akis:
1. `Controller` istegi alir ve service'e delege eder.
2. `Service` policy + validator + repository orkestrasyonunu yapar.
3. `Policy` gecerlilik kurallarini netlestirir.
4. `Repository` kalicilik/sorgu yapar.
5. `Mapper` DTO donusumunu tamamlar.
6. Gerekirse `event` yayinlanir, yan etkiler listener tarafinda ele alinir.

Prensipler:
- Durum gecisi kurali service icine dagitilmaz; policy merkezli kalir.
- Para hareketi detaylari `payment` orchestrator/executor katmanina devredilir.
- Event dinleyicileri ana transaction kararini bozmaz.

## 4) Ana Is Akislari

### 4.1 Checkout Sonrasi Siparis Olusturma
1. Checkout orkestrasyonu siparis olusturma adimini tetikler.
2. `OrderCreationService` siparis + item + shipping olusturur.
3. Odeme sonucu basariliysa siparis onaylanir ve escrow olusturma tetiklenir.
4. Sonuc event ile dis aksiyonlara yayilir.

### 4.2 Durum Gecisi ve Otomatik Ilerleme
1. `OrderCompletionScheduler` periodik calisir.
2. Durumlar zaman esiklerine gore ilerletilir.
3. Tamamlama adiminda once escrow release denenir.
4. Release basariliysa `COMPLETED` ve ilgili eventler yazilir.

### 4.3 Manuel Tamamlama
1. Kullanici aksiyonu policy kurallarindan gecer.
2. Escrow release yapilir.
3. Durum `COMPLETED` edilir ve event yayinlanir.

### 4.4 Iptal
1. Iptal uygunlugu policy/validation ile dogrulanir.
2. Item bazli kompanzasyon plani cikarilir.
3. Escrow iptal + alici iadesi payment orchestrator ile yapilir.
4. Kalici kayitlar yazilir ve `OrderCancelledEvent` yayinlanir.

### 4.5 Iade
1. Iade uygunlugu policy ile kontrol edilir.
2. Satıcı ve escrow kaynakli iade akisi payment orchestrator ile isletilir.
3. Kayitlar guncellenir ve `OrderRefundedEvent` yayinlanir.

## 5) Kritik Is Kurallari

- Gecersiz durum gecisleri policy katmaninda engellenir.
- Tamamlama, escrow release basarisizsa finalize edilmez.
- Iptal ve iade kararinda item bazli plan zorunludur.
- Event yayinlari domain karari tamamlandiktan sonra yapilir.

## 6) Performans ve Davranissal Risk Notlari

- Query tarafinda item/shipping/escrow baglantilari N+1 riski acisindan izlenmelidir.
- Scheduler akisi buyuk veri setinde toplu isleme uygun kalmalidir.
- Iptal/iade akislarinda kismi basari senaryolari idempotent ele alinmalidir.
- Mapper tarafinda ek relation erisimi eklenirse liste endpoint maliyeti yeniden olculmelidir.

## 7) Bir Degisiklik Yapacaginda Ne Yapacaksin?

### A) Durum kurali degistirmek
1. Once `policy` siniflarini guncelle.
2. Sonra ilgili service akisini policy sonucuna gore revize et.
3. Event tetikleme kosullarini kontrol et.
4. `OrderErrorCodes` semantigini bozmadan hata durumlarini hizala.

### B) Iptal/Iade davranisi degistirmek
1. `OrderCancellationService` veya `OrderRefundService` akisini belirle.
2. `OrderItemCompensationPlanner` ve kalicilik adimlarini birlikte ele al.
3. Payment orchestrator cagri semantigini kontrol et.
4. Event ve bildirim zincirini tekrar dogrula.

### C) Yeni endpoint eklemek
1. `OrderController` imzasini ekle.
2. Is mantigini service'e tasi.
3. Gerekirse DTO + mapper + repository metotlarini birlikte guncelle.
4. Yetki/sahiplik kontrolunun servis katmaninda oldugundan emin ol.

## 8) Yeni Ozellik Eklerken Hizli Runbook

1. Ozelligin hangi asamaya ait oldugunu netlestir: olusturma, gecis, tamamlama, iptal, iade.
2. Etkilenen policy'leri tespit et; kurali once policy'de tanimla.
3. Service orkestrasyonunu yeni kurala gore guncelle.
4. Payment ile temas varsa order tarafinda sadece orkestrasyon karari al, para detayina girme.
5. Event etkisini kontrol et:
   - Hangi event cikmali/cikmamali
   - Listener yan etkisi ana karari etkilememeli
6. Davranissal risk testi ekle:
   - Scheduler gecisi
   - Escrow release basarisizlik senaryosu
   - Iptal/iade kismi basari senaryosu

## 9) AI Ajanlari Icin Kisa Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. `Controller -> Service -> Policy -> Repository -> Mapper` zincirini sirayla izle.
2. Durum gecisi kuralini service icine dagitma, policy merkezli tut.
3. Payment ile ilgili degisiklikte order tarafinda sadece orkestrasyon kararini degistir.
4. Event cikis noktalarini koru; commit sonrasi yan etki modelini bozma.
