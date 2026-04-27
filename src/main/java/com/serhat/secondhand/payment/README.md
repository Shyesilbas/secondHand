# Payment Paketi Teknik Rehber

Bu dokumanin amaci:
- `payment` paketindeki karar noktalarini ve akislari tek yerde netlestirmek
- Insan ve AI gelistiricilerin degisiklik etkisini hizli ve dogru analiz etmesini saglamak
- Idempotency, verification, event ve escrow akislarinda davranissal riski azaltmak

## 1) Paketin Amaci ve Sinirlari

`payment` paketi, odeme isleme motorunu saglar: pre-check, strateji secimi, odeme kaydi, event yayini ve escrow para akislarinin orchestrasyonu.

Kapsam:
- Odeme istegi calistirma (`PaymentProcessor`)
- Idempotency ve optimistic lock retry
- Verification code gereksinimi/validasyonu
- Strateji tabanli odeme (`credit card`, `bank`, `ewallet`)
- Odeme tamamlama event zinciri ve handler dispatch
- Escrow create/release/cancel-refund/refund akislari (orchestrator + executor)

Kapsam disi:
- Siparis domain kararlari (`order`)
- Ilan yayina alma ana akisi (`listing`)
- Kimlik dogrulama ve genel guvenlik altyapisi (`auth`, `security`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/*`
  - `PaymentController`, `CreditCardController`, `BankController`.

- `application/*`
  - `PaymentProcessor`, `PaymentPreCheckService`, `PaymentVerificationService`.
  - `PaymentCompletedEventListener`, `PaymentCompletedHandlerRegistry`.
  - `PaymentRequestFactory`, `OrderPaymentService`, `PaymentNotificationService`.

- `application/handlers/*`
  - Event sonrasi transaction tipine gore domain yan etkisi calistiran handlerlar.

- `strategy/*`, `creditcard/*`, `bank/*`
  - Odeme yontemi stratejileri ve ilgili validator/service katmanlari.

- `orchestrator/*`
  - Escrow para hareketi akislarinin uygulama katmani koordinasyonu.

- `entity/*`, `entity/events/*`
  - `Payment` ve iliskili enumlar, `PaymentCompletedEvent`.

- `repository/*`, `mapper/*`, `validator/*`, `util/*`, `helper/*`
  - Kalicilik, donusum, dogrulama, sabit/hata kodu, teknik yardimci siniflar.

## 3) Standart Akis ve Karar Noktalari

Standart akis:
1. API istegi `PaymentProcessor`e gelir.
2. `PaymentPreCheckService` dogrulama zincirini calistirir.
3. `PaymentStrategyFactory` uygun stratejiyi secer.
4. Islem sonucu `Payment` kaydi olusturulur.
5. Basarili islemlerde `PaymentCompletedEvent` yayinlanir.
6. `AFTER_COMMIT` listener tarafinda handler + bildirim yan etkileri calisir.

Karar noktasi prensipleri:
- Idempotency kurali `PaymentProcessor` disina dagitilmaz. `orderId` ve `status` alanlari bu surecte korunur.
- Verification davranisi pre-check akisinin parcasi olarak kalir.
- Event sonrasi isler (bildirim, handler) ana transaction kararindan ayrik tutulur ve hem gondereni hem aliciyi bilgilendirir.
- Odeme yonu (`INCOMING/OUTGOING`) ve islem tipi (`ITEM_SALE/PURCHASE`) veritabaninda statik tutulmak yerine kullanici bazli dinamik cozumlenir.

## 4) Ana Is Akislari

### 4.1 Odeme Isleme
1. Istek gelir ve idempotency kontrolunden gecer.
2. Pre-check: kullanici, agreement, verification, request dogrulama.
3. Strateji secilir ve odeme yurutulur.
4. Sonuc kaydedilir, basariliysa event yazilir.

### 4.2 Verification Akisi
1. Kod gerekli ise kod uretilip gonderilir.
2. Ilk istekte dogrulama zorunlu hata semantigi donulebilir.
3. Sonraki istekte kod dogrulanir ve islem devam eder.

### 4.3 Event Sonrasi Isleme
1. `PaymentCompletedEventListener` `AFTER_COMMIT` fazinda calisir.
2. Handler registry uygun handleri order sirasina gore secip calistirir.
3. Bildirim servisi basari bildirimi uretir.

### 4.4 Escrow Akislari
1. Siparis odemesi sonrasi tek bir `Payment` kaydi (`status=ESCROW`) olusturulur.
2. Tamamlama asamasinda bu kayit guncellenir (`status=COMPLETED`).
3. Iptalde bu kayit guncellenir (`status=CANCELLED`) ve alici iadesi wallet uzerinden yapilir.
4. Teslim sonrasi iadede kayit guncellenir (`status=REFUNDED`) ve satıcıdan kesip aliciya refund yapilir.
5. Tum durum degisikliklerinde (`release`, `refund` vb.) event yayinlanarak bildirimler tetiklenir.

## 5) Kritik Is Kurallari

- Ayni `idempotencyKey + fromUserId` kombinasyonu ikinci kez para cekmez. Islem tekrarlarinda mevcut kaydin `orderId` ve `status` bilgileri korunarak guncellenir.
- Optimistic lock hatasinda retry uygulanir; sinir asilirsa esit hata kodu doner.
- Verification gereksinimi saglanmadan odeme finalize edilmez.
- Event tabanli yan etkiler commit oncesi tetiklenmez.

## 6) Performans ve Davranissal Risk Notlari

- Escrow create akisi bulk veri cekimiyle N+1 riskini azaltacak sekilde kalmalidir.
- Handler zinciri buyudukce `supports` kosullari deterministic tutulmalidir.
- Retry/backoff sabitleri trafik yogunlugunda operasyonel olarak izlenmelidir.
- Stats/list endpointlerinde veriler kullaniciya gore filtrelenir (Gonderen=Outgoing, Alici=Incoming) ve internal sistem islemleri istatistiklere dogru yansitilir.

## 7) Bir Degisiklik Yapacaginda Ne Yapacaksin?

### A) Odeme kurali degistirmek
1. Kararin pre-check mi strategy mi oldugunu belirle.
2. Pre-check ise `PaymentPreCheckService`, strategy ise ilgili strategy sinifini guncelle.
3. `PaymentErrorCodes` ile hata semantigini hizala.
4. `PaymentProcessor` akisini bozmadigini kontrol et.

### B) Yeni odeme tipi eklemek
1. `PaymentType` ve gerekiyorsa transaction tipi enumlarini guncelle.
2. Yeni `PaymentStrategy` implementasyonu ekle.
3. `PaymentStrategyFactory` secim mantigina dahil et.
4. Request/validator/mapper alanlarini es zamanli guncelle.
5. Gerekliyse verification gereksinimini acikca tanimla.

### C) Event sonrasi yeni davranis eklemek
1. Yeni handler yaz ve `supports` kosulunu net tanimla.
2. `@Order` konumunu bilincli belirle.
3. Handler idempotency beklentisini not et.
4. Bildirim ve yan etkilerin commit sonrasi oldugunu koru.

## 8) Yeni Ozellik Eklerken Hizli Runbook

1. Ozelligin seviyesini belirle: pre-check, strategy, processor, event-handler, escrow.
2. Etki haritasi cikar:
   - API/DTO
   - Domain servis
   - Strategy/validator
   - Repository/entity
3. Idempotency ve verification etkisini zorunlu kontrol et.
4. Event sonrasi yan etki gerekiyorsa handler olarak ekle; ana transactiona baglama.
5. Escrow ile temas varsa orchestrator/executor ayrimini koru.
6. Test kapsami:
   - Cift istek/idempotency
   - Verification required -> verify -> success
   - Handler secim sirasi
   - Escrow basari/basarisizlik senaryolari

## 9) AI Ajanlari Icin Kisa Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. Once `Processor -> PreCheck -> Strategy -> Repository -> Event` zincirini takip et.
2. Idempotency/verification kurallarini farkli katmana dagitma.
3. Event sonrasi davranislari handler katmanina tasi.
4. Escrow degisikligini orchestrator/executor ayrimini bozmayacak sekilde yap.