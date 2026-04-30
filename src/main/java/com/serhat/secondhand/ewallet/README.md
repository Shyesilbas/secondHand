# EWallet Paketi Teknik Rehber

Bu dokumanin amaci:
- `ewallet` (Elektronik Cuzdan) paketindeki karar noktalarini, is akislarini ve limit kontrollerini tek yerde netlestirmek
- Insan ve AI gelistiricilerin degisiklik etkisini hizli ve dogru analiz etmesini saglamak
- Cüzdan bakiye, para yatirma, para cekme ve guvenlik limit akislarinda (spending warning) davranissal riski azaltmak

## 1) Paketin Amaci ve Sinirlari

`ewallet` paketi, platform icerisindeki kullanicilarin dahili elektronik cuzdanlarini, bakiyelerini ve bu cuzdan uzerindeki limit/guvenlik ayarlarini yonetir.

Kapsam:
- E-Cuzdan olusturma ve bakiye sorgulama (`EWalletService`)
- Para yatirma (deposit) ve para cekme (withdraw) islemleri
- Maksimum cüzdan limiti (limit) ve Harcama Uyari Limiti (spendingWarningLimit) yonetimi
- E-Cuzdan uzerinden gerceklesen siparis odemelerinin bakiye kontrolleri (Sufficient Balance, Spending Warning %90 kontrolu)
- Puan/Bakiye yukleme, satis sonrasi kazanc aktarimi (`creditToUser`) ve iade/iptal dususleri (`debitFromUser`). Bu islemlerde `counterpartUser` (karsi taraf) bilgisi alinarak islem gonderici ve alicisi dogru kaydedilir. Escrow iadelerinde para sistemden (escrow'dan) aliciya dondugu icin `counterpartUser=null` gecirilir ve `fromUser` otomatik olarak aliciya (paranin sahibine) atanir.

Kapsam disi:
- Gercek banka entegrasyonu detaylari (`payment.bank` altinda yonetilir)
- Odeme orchestration'i ana akisi (`payment` paketinde `CheckoutOrchestrator` ve `PaymentProcessor` tarafindan yonetilir)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/*`
  - `EWalletController`: REST endpoint'leri. Deposit, withdraw, balance/spending limit update ve kontrollerini sunar.

- `application/*`
  - `EWalletService`, `IEWalletService`: Ana business logic katmani. Bakiye yukleme, cekme, harcama uyari threshold hesaplama (aylik harcama sum kontrolu).

- `dto/*`
  - `EWalletDto`, `EwalletRequest`, `DepositRequest`, `WithdrawRequest`, `SpendingWarningCheckResponse`.

- `entity/*`
  - `EWallet`: Cüzdan veritabani modeli (id, user_id, balance, walletLimit, spendingWarningLimit vs.).

- `repository/*`
  - `EWalletRepository`: EWallet DB operasyonlari (pessimistic lock ile).

- `validator/*`
  - `EWalletValidator`: Bakiye yeterliligi, banka hesabi validasyonu, limit kontrolleri.

- `mapper/*`, `util/*`
  - Donusumler (MapStruct) ve Bakiye islemleri (EWalletBalanceUtil) icin kullanilan utility fonksiyonlari.

## 3) Standart Akis ve Karar Noktalari

Standart akis:
1. Kullanici platformda ilk e-cuzdan etkilesiminde (veya kayitta) e-cuzdan otomatik olusturulur (`creditToUser` fallback).
2. Odemelerde (Checkout), e-cuzdan secildiginde pre-check yapilir.
3. On-pre-check asamasinda `spending-warning/check` ile eger harcama `spendingWarningLimit`'in %90'ina variyorsa frontend'e uyari donulur.
4. Cekim ve Yükleme (Withdraw/Deposit) islemlerinde banka hesabi dogrulanir ve islem onaylanir.

Karar noktasi prensipleri:
- **Pessimistic Locking:** Bakiye degisiklikleri `findByUserWithLock` kullanilarak concurrency hatalarina (race condition) karsi korunur.
- Limit kurali `EWalletValidator` disinda by-pass edilemez.

## 4) Ana Is Akislari

### 4.1 Cüzdan ile Odeme Yapma (Checkout)
1. Frontend `checkSpendingWarning` cagirir. Aylik toplam e-cuzdan cıkıslari (PaymentRepository uzerinden) ve yeni siparis tutari toplanir.
2. Eger mevcut harcama + siparis tutari `spendingWarningLimit`'in %90'i veya ustundeyse Frontend uyari gosterir.
3. Kullanici onaylarsa islem `payment` paketine gider, `processEWalletPayment` calisir ve bakiye eksi yonde guncellenir.

### 4.2 Para Yatirma (Deposit)
1. Kullanici tutar ve Banka ID iletir.
2. `EWalletValidator` cüzdan limitine ulasilip ulasilmadigini kontrol eder.
3. `bankService.debit` ile bankadan para cekilir, `eWallet.setBalance` ile cuzdan artirilir.

### 4.3 Para Cekme (Withdraw)
1. Kullanici tutar ve Banka ID iletir.
2. Bakiye yeterliligi dogrulanir.
3. `eWallet.setBalance` ile bakiye dusurulur, `bankService.credit` ile bankaya para gonderilir.

## 5) Kritik Is Kurallari

- Bakiye hicbir zaman eksiye dusemez (Sufficient Balance kurali kesin olarak isler).
- Veritabanindaki `from_user_id` NOT NULL kısıtı geregi, sistem tarafindan tetiklenen islem dahi olsa (deposit, refund vs.) `fromUser` hicbir zaman null olamaz. Alici-Satici iliskisine gore (counterpart) veya deposit/withdraw durumunda paranin sahibi atanir.
- Ayni anda ayni cüzdandan birden fazla islem gecmesini engellemek icin DB bazli `PESSIMISTIC_WRITE` lock kullanilir.
- Aylik harcama uyari limitinde (spending warning) **sadece basarili (isSuccess=true) ve disari yonlu (OUTGOING)** islemler toplanir.

## 6) Performans ve Davranissal Risk Notlari

- `findByUserWithLock` lock suresini uzatmamak icin, lock alinan transaction icerisinde uzun suren dis network cagrilarindan (or. gercek banka API cagirisi) kacinilmalidir.
- `sumMonthlyEwalletSpending` query'si her odeme oncesinde calisacagi icin, `Payment` tablosunda `(fromUser, paymentType, paymentDirection, processedAt, isSuccess)` alanlarinda dogru index'leme olmalidir.

## 7) Bir Degisiklik Yapacaginda Ne Yapacaksin?

### A) Bakiye Kurallarini Degistirmek
1. Karari `EWalletValidator` icinde al.
2. Eğer islem para cekme veya yuklemeyi engelliyorsa, uygun Custom Exception firlat.
3. Lock yapisini asla bozma. Bakiye modifikasyonu olan metodlarda `@Transactional` zorunludur.

### B) Yeni E-Cuzdan Parametresi Eklemek (Orn. Gunluk Limit)
1. `EWallet` entity'sine ekle.
2. DTO ve Mapper katmanini guncelle.
3. `EWalletController` da CRUD / Update endpointlerini tanimla.
4. Eger harcama oncesi kontrol gerektiriyorsa `EWalletService.checkSpendingWarning` tarzi ozel bir endpoint'e ekle ve Frontend ile entegre et.

## 8) Yeni Ozellik Eklerken Hizli Runbook

1. Etki haritasi cikar: Parametre db tabanli mi, gecici mi?
2. Validation kurallari icin validator layer'da yeni metod yarat.
3. Transaction isolation ve Pessimistic lock etki alanina dikkat et.
4. Test kapsami:
   - Concurrency (Race condition) senaryosu.
   - Limit asimi senaryosu (ozellikle %90 Spending Warning ve Over-limit testleri).
   - Deposit / Withdraw banka entegrasyonlarinda exception firlatma rollback testleri.

## 9) AI Ajanlari Icin Kisa Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. Her bakiye (`balance`) guncellemesinde `findByUserWithLock` veya alternatif bir locking stratejisini oldugu gibi koru. Lock'i bozan veya locksuz bakiye azaltan kod yazma.
2. `spendingWarningLimit` gibi kontrol/read islemlerinde lock gerekmez, `findByUser` kullanabilirsin.
3. Bir transaction isleminde `PaymentResult` veya `Payment` entity log'unun (record) repository'ye kaydedildigini atlama. Cüzdan bakiyesi arttiginda veya azaldiginda mutlak suretle bunun nedenini (Deposit, Item Sale, Refund vs.) ifade eden bir Payment event'i yansitilmalidir.
