# Agreements Paketi Teknik Rehber

Bu dokumanin amaci:
- `agreements` paketinin sorumluluklarini tek yerde netlestirmek
- Degisiklik yaparken regresyon, performans ve tutarlilik riskini azaltmak

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## 1) Paketin Amaci ve Sinirlari

`agreements` paketi, sistemdeki sozlesme/metin yonetimi ve kullanici kabul durumlarinin takibinden sorumludur.

Kapsam:
- Agreement olusturma ve guncelleme
- Version yonetimi
- Group bazli zorunlu agreement tanimi
- Kullanicinin agreement kabul kayitlari
- Agreement guncelleme event izleme ve e-posta bilgilendirme

Kapsam disi:
- Kullanici kayit/login ana akislari (`auth`)
- E-posta altyapisinin teknik gonderim detaylari (`email`)
- Genel notification template detaylari (`notification`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/AgreementController.java`
  - HTTP giris noktasi.
  - Request alir, service'lere delege eder, DTO response dondurur.

- `application/AgreementService.java`
  - Agreement CRUD ve version artirma mantigi.
  - `AgreementConfig` uzerinden default content okur.

- `application/AgreementRequirementService.java`
  - Group bazli zorunlu agreement tiplerini yonetir.
  - `AgreementRequirement` kayitlarini upsert eder.

- `application/UserAgreementService.java`
  - Kullanici kabul islemleri ve acceptance history.
  - "latest version" uyumunu korur, batch kabul akisini yonetir.

- `application/AgreementAcceptanceBackfillHelper.java`
  - Kabul kaydi gecmis uyumlulugu icin ortak kural helper'i.
  - Duplicate is kurali drift riskini azaltir.

- `application/AgreementUpdateWatcher.java`
  - Scheduler ile yeni version yayini tespiti.
  - `AgreementUpdateEvent` yazip broadcast email akisina girer.

- `application/AgreementEmailNotificationService.java`
  - Outdated/broadcast e-posta bilgilendirmesi.
  - Batch user isleme ve duplicate mail filtreleme.

- `application/AgreementUpdateNotificationService.java`
  - Tek kullanici bazli outdated kontrol ve bildirim.

- `application/AgreementDataInitializer.java`
  - Seed task: agreement + requirement varsayilanlarini olusturur.

- `application/AgreementSchemaStartupRunner.java`
  - Startup sirasinda PostgreSQL icin `agreements.content` kolon tipi kontrolu/duzeltmesi.

- `repository/*`
  - `AgreementRepository`: type/id bazli agreement sorgulari.
  - `AgreementRequirementRepository`: group + active requirement sorgulari.
  - `UserAgreementRepository`: kullanici kabul sorgulari, `EntityGraph` ile fetch optimizasyonu.
  - `AgreementUpdateEventRepository`: version event idempotency sorgulari.

- `entity/*`
  - `Agreement`, `UserAgreement`, `AgreementRequirement`, `AgreementUpdateEvent`.
  - `entity/enums/*`: `AgreementType`, `AgreementGroup`.

- `mapper/*`
  - `AgreementMapper`, `UserAgreementMapper`.

- `dto/*`
  - API contract modelleri (`AgreementDto`, `UserAgreementDto`, request dto'lari).

- `util/AgreementErrorCodes.java`
  - Module ait hata kodlari ve HTTP status standardi.

## 3) Katmanlar Arasi Standart Akis

Standart akis:
1. `Controller` request alir, temel parametre validasyonu yapar.
2. `Service` business rule uygular.
3. `Repository` persistence/sorgu yapar.
4. `Mapper` entity -> dto donusumu yapar.
5. `Controller` response dondurur.

Bu pakette ana akis prensibi:
- Rule'lar service katmaninda tutulur.
- Repository sadece data access sorumlulugu tasir.
- Mapper tarafinda lazy relation erisiminden kaynakli N+1 riski izlenir.

## 4) Ana Is Akislari

### 4.1 Agreement initialize
1. `AgreementController.initializeAgreements`
2. `AgreementService.createAgreements`
3. `AgreementRequirementService.initializeDefaultRequirements`
4. Tum agreement'lar DTO olarak doner

Not:
- Bu endpoint agir bir operasyon tetikleyebilir. Erisim kontrolu net olmalidir.

### 4.2 Kullanici agreement kabul
1. `POST /api/agreements/accept`
2. `UserAgreementService.acceptAgreement`
3. Kullanici ve agreement bulunur
4. Mevcut `UserAgreement` varsa guncellenir, yoksa olusturulur
5. `acceptedVersion`, `acceptedTheLastVersion`, `acceptedDate` set edilir

### 4.3 Kullanici kabul durumlarini cekme
1. `GET /api/agreements/user/agreements`
2. `UserAgreementService.getUserAgreements`
3. `EntityGraph` ile agreement relation'i beraber cekilir
4. Gecmis kayitlar icin backfill/latest uyumu gerekiyorsa duzeltilir
5. Gerekirse toplu `saveAll` yapilir ve DTO donulur

### 4.4 Required agreements toplu kabul (arka plan/operasyonel)
1. `UserAgreementService.acceptRequiredAgreementsForAllUsers`
2. Tum user ve required type listesi alinır
3. Agreement'lar type bazli tek seferde maplenir
4. Mevcut user-agreement kayitlari toplu cekilir
5. Yeni/guncel kayitlar bellekte olusturulur
6. Tek toplu `saveAll` ile yazilir

### 4.5 Version publish ve email bildirimi
1. `AgreementUpdateWatcher` periyodik calisir
2. Required type'lar icin current version kontrol edilir
3. `AgreementUpdateEvent` yoksa insert edilir
4. Insert basariliysa `notifyAllUsersAgreementPublished` cagrilir
5. Batch user isleme ile duplicate mailler filtrelenir

## 5) Kritik Is Kurallari

- `acceptedVersion` bos ise ve gecmis kabul latest ile uyumluysa backfill yapilir.
- `acceptedTheLastVersion`, anlik agreement version ile tutarli tutulur.
- Required agreement listesi `AgreementGroup` tanimlarina gore initialize edilir.
- Version publish event'lerinde idempotency `agreement_type + version` unique constraint ile korunur.
- Manual version update'te format validasyonu zorunludur.

## 6) Endpoint Haritasi

Taban yol: `/api/agreements`

- `GET /` -> tum agreement'lar
- `POST /initialize` -> default agreement + requirement olusturma
- `GET /required?agreementGroup=...` -> group bazli required agreement listesi
- `GET /{agreementType}` -> type bazli agreement
- `POST /accept` -> kullanici kabul islemi
- `GET /user/agreements` -> kullanici tum kabul kayitlari
- `GET /user/status/{agreementType}` -> belirli type icin kabul statusu
- `GET /user/acceptance-history/{agreementId}` -> kullanici agreement kabul gecmisi

## 7) Konfigurasyon ve Sabitler

- Agreement default content kaynaklari `AgreementConfig` altindadir.
- Version default degeri `AgreementService` tarafinda `1.0.0`.
- Watcher interval `AgreementUpdateWatcher.CHECK_INTERVAL_MS`.
- Broadcast batch size `AgreementEmailNotificationService.BROADCAST_BATCH_SIZE`.

Kural:
- Yeni magic number ekleme.
- Konfigurable olacak degerleri merkezi config/sabit yapisina tasi.

## 8) Performans Notlari

- `UserAgreementRepository` icinde `@EntityGraph(attributePaths = "agreement")` kullanimi mapper kaynakli N+1 riskini azaltir.
- Broadcast email akisinda user bazli `existsBy...` dongusu yerine batch query ile "already sent" seti cekilir.
- Toplu required acceptance akisi tek tek query yerine batch fetch + toplu save ile calisir.

Dikkat:
- Yeni mapper alanlari eklendiginde relation lazy fetch etkisi tekrar kontrol edilmelidir.

## 9) Tutarlilik ve Hata Yonetimi

- Modulde domain hatalari icin tercihen `BusinessException + AgreementErrorCodes` kullan.
- `IllegalArgumentException` kullanimi daginikligi API hata formatini bozabilir.
- Yeni hata durumu eklerken:
  1. `AgreementErrorCodes` icine ekle
  2. Service katmaninda bu kodu kullan
  3. Controller'da hardcoded message ile throw etme

## 10) Siklikla Yapilan Degisiklikler (Ne Yapacagim?)

### A) Yeni agreement type eklemek
1. `AgreementType` enum'una tipi ekle
2. `AgreementConfig` altinda content kaynagini ekle
3. `AgreementService.getContentForType` switch'ine ekle
4. Gerekliyse `AgreementGroup` required listelerine dahil et
5. Initialize ve required endpoint akislarini dogrula

### B) Required group kuralini degistirmek
1. `AgreementGroup` icindeki required type tanimini guncelle
2. `AgreementRequirementService.initializeDefaultRequirements` davranisini kontrol et
3. Mevcut data migration etkisini degerlendir

### C) Accept davranisini degistirmek
1. `AcceptAgreementRequest` kontratini guncelle
2. `UserAgreementService.acceptAgreement` set ettigi alanlari revize et
3. `UserAgreementMapper` ve response kontratini dogrula
4. Backfill/latest uyum kuralini bozmadigindan emin ol

### D) Scheduler/broadcast davranisini degistirmek
1. `AgreementUpdateWatcher` interval ve event yazim mantigini guncelle
2. `AgreementUpdateEvent` idempotency kuralini koru
3. `AgreementEmailNotificationService` batch ve duplicate filtre semantigini koru

### E) Yeni endpoint eklemek
1. Controller imzasini ekle
2. Is mantigini service'e tasi
3. Gerekliyse repository query + mapper + dto'yu birlikte guncelle
4. Security etkisini netlestir

