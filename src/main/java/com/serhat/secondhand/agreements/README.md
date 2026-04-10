# Agreements Paketi Teknik Rehber

Bu dokumanin amaci:
- `agreements` paketinin sorumluluklarini tek yerde netlestirmek
- Degisiklik yaparken regresyon, performans ve tutarlilik riskini azaltmak

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

## 11) AI Ajanlari Icin Hizli Protokol

Bu pakette otomatik degisiklik yapan ajanlar:
1. Once `Controller -> Service -> Repository -> Mapper -> Entity` zincirini izle.
2. Query veya method imzasi degisiyorsa tum cagrilan katmanlari birlikte guncelle.
3. N+1 riski icin mapper'da relation alanlarina bak; gerekiyorsa `EntityGraph` veya batch query kullan.
4. Hata yonetiminde hardcoded metin yerine `AgreementErrorCodes` odakli kal.
5. Toplu is akislarda (all users, broadcast) tek tek DB call yerine batch tasarim kur.
6. Duplicate business rule gordugunde ortak helper/service'e tasiyarak tekillestir.
7. Scheduler akislarda race condition ihtimalini idempotent/exception-safe hale getir.

## 12) Degisiklik Oncesi / Sonrasi Checklist

Degisiklik oncesi:
- Etkilenen endpoint ve service methodunu netlestir
- Data modeli/DTO kontrat etkisini belirle
- Performans etkisini (N+1, batch, I/O) not et
- Security etkisini (ozellikle init gibi operasyonel endpointler) not et

Degisiklik sonrasi:
- Derleme ve lint durumunu kontrol et
- Kabul, status ve history endpointlerini davranissal test et
- Scheduler/broadcast degisti ise duplicate email uretmedigini dogrula
- Error code ve HTTP status tutarliligini kontrol et

## 13) Bilinen Teknik Borc / Dikkat Noktalari

- `AgreementSchemaStartupRunner` startup'ta DDL denemesi yapar; uzun vadede migration aracina tasinmasi daha guvenlidir.
- Bazi noktalarda exception stratejisi tam standardize degildir; zamanla tek hata modeli etrafinda toplanmalidir.
- Initialize endpoint operasyonel maliyetli olabilir; erisim kontrolu net ve kisitli olmalidir.

Bu rehber korunursa `agreements` paketi daha ongorulebilir, bakimi kolay ve performans acisindan daha guvenli kalir.

## 14) Ornek Degisiklik Playbook

Bu bolum, "tam olarak neyi hangi sirayla degistirecegim?" sorusuna operasyonel cevap verir.

### Playbook 1: Yeni agreement type ekleme (ornek: `MARKETING_CONSENT`)

Hedef:
- Sisteme yeni bir agreement tipi eklemek
- Gerekirse belirli group'larda required yapmak

Adimlar:
1. `entity/enums/AgreementType.java`
   - Yeni enum degerini ekle.
2. `core/config/AgreementConfig` + `application.yml`
   - Yeni type'in default content alanini tanimla.
3. `application/AgreementService.java`
   - `getContentForType` switch'ine yeni case ekle.
4. `entity/enums/AgreementGroup.java` (gerekiyorsa)
   - Type'i ilgili required group listesine ekle.
5. `application/AgreementRequirementService.java`
   - Initialize akisi yeni enum ile uyumlu mu kontrol et.
6. `api/AgreementController.java`
   - Endpoint degisikligi gerekmiyorsa dokunma.
7. Seed/initialize akislarini dogrula
   - `AgreementDataInitializer` calistiginda yeni kayit olusuyor mu kontrol et.

Risk noktasi:
- `AgreementService.getContentForType` switch eksik case kalirsa runtime hata alinabilir.

Done kriteri:
- `GET /api/agreements` yeni type'i donduruyor
- `GET /api/agreements/required?agreementGroup=...` beklenen grouplarda dogru geliyor

### Playbook 2: Required group kurali degisikligi

Hedef:
- Belirli bir group icin required tipleri arttirmak/azaltmak

Adimlar:
1. `entity/enums/AgreementGroup.java`
   - `requiredTypes` dizisini guncelle.
2. `application/AgreementRequirementService.java`
   - `initializeDefaultRequirements` akisinin yeni set ile calistigini kontrol et.
3. Veri etkisini degerlendir
   - Eski requirement kayitlari aktif/pasif davranisi istenen sonuca uygun mu.

Risk noktasi:
- Sadece enum degistirip production verisini guncellemezsen mevcut kayitlarla uyumsuzluk olusabilir.

Done kriteri:
- Group bazli required listesi beklenen sirada ve kapsamda donuyor.

### Playbook 3: Accept request kontrati degisikligi

Hedef:
- `POST /accept` request/response davranisini degistirmek

Adimlar:
1. `dto/request/AcceptAgreementRequest.java`
   - Yeni alan ekle veya mevcut alani revize et.
2. `application/UserAgreementService.java`
   - `acceptAgreement` icinde yeni alani business kurala bagla.
3. `mapper/UserAgreementMapper.java` ve `dto/UserAgreementDto.java`
   - Response'a yansiyacak alan varsa mapper/dto guncelle.
4. `api/AgreementController.java`
   - Validasyon anotasyonlari ve endpoint kontratini kontrol et.

Risk noktasi:
- Request alanini DTO'da ekleyip service'te kullanmazsan sessiz davranis sapmasi olur.

Done kriteri:
- Yeni request alani davranisa birebir yansiyor
- Backfill/latest uyum kurali bozulmuyor

### Playbook 4: Version policy degisikligi (manual veya otomatik)

Hedef:
- Version artirma kurali veya format dogrulamasini degistirmek

Adimlar:
1. `application/AgreementVersionHelper.java`
   - `incrementVersion`, `isValidVersion`, `handleContentChange` davranisini guncelle.
2. `application/AgreementService.java`
   - `updateAgreement` ve `updateAgreementWithVersion` akislarinin helper ile tutarli oldugunu kontrol et.
3. `util/AgreementErrorCodes.java`
   - Gerekliyse yeni hata kodu ekle.

Risk noktasi:
- Version formati gevsetilirken eski verilerle karsilastirma mantigi bozulabilir.

Done kriteri:
- Istenen format disi versiyonlar deterministic sekilde reddediliyor
- Content degisimi oldugunda version policy beklenen sonucu uretiyor

### Playbook 5: Broadcast email davranisi degisikligi

Hedef:
- Tum kullanicilara agreement update bilgilendirme stratejisini degistirmek

Adimlar:
1. `application/AgreementEmailNotificationService.java`
   - Batch size, duplicate filtre veya subject/body kurallarini guncelle.
2. `email/domain/repository/EmailRepository.java`
   - Batch filtreleme icin query gerekiyorsa repository methodu ekle/guncelle.
3. `application/AgreementUpdateWatcher.java`
   - Publish tetikleme noktasinin degismedigini ve idempotency'nin korundugunu dogrula.

Risk noktasi:
- User basina tekrarli mail gonderimi
- Buyuk user tabaninda tekil query ile I/O patlamasi

Done kriteri:
- Ayni `type+version` icin ikinci broadcast duplicate mail uretmiyor
- Batch akisinda query adedi lineer ama kontrollu kalıyor

### Playbook 6: Scheduler interval ve event idempotency degisikligi

Hedef:
- Watcher calisma sikligini veya event yazim semantigini degistirmek

Adimlar:
1. `application/AgreementUpdateWatcher.java`
   - Interval sabitini veya property baglantisini guncelle.
2. `entity/AgreementUpdateEvent.java`
   - Unique constraint davranisini degistireceksen migration etkisini degerlendir.
3. `repository/AgreementUpdateEventRepository.java`
   - Yeni idempotency stratejisine uygun query methodlarini guncelle.

Risk noktasi:
- Multi-instance deployment'ta check-then-insert yarisi
- Fazla sik watcher calisip gereksiz DB/mail yuku olusturmasi

Done kriteri:
- Yarista duplicate insert exception'i ana akis bozmaz
- Interval degisikligi beklenen yuk profiline uygun

### Playbook 7: Error handling standardizasyonu

Hedef:
- Modul genelinde tek tip hata davranisi

Adimlar:
1. `api/AgreementController.java` ve `application/*`
   - `IllegalArgumentException` kullanimlarini tarayip uygun `BusinessException` ile degistir.
2. `util/AgreementErrorCodes.java`
   - Eksik domain hata kodlarini tamamla.
3. Global exception handler uyumu
   - API response formatinin tum endpointlerde tutarli oldugunu kontrol et.

Risk noktasi:
- Ayni hata durumunda farkli endpointler farkli response format/HTTP status donmesi

Done kriteri:
- Tum agreement endpointlerinde hata cevabi semasi tutarli

## 15) Hedefli Test Matrisi (Playbook Sonrasi)

Degisiklik turune gore minimum test:
- Type/group degisikligi:
  - `GET /api/agreements`
  - `GET /api/agreements/required?agreementGroup=...`
- Accept degisikligi:
  - `POST /api/agreements/accept`
  - `GET /api/agreements/user/status/{agreementType}`
  - `GET /api/agreements/user/agreements`
- Version policy degisikligi:
  - `updateAgreement` + `updateAgreementWithVersion`
- Broadcast/scheduler degisikligi:
  - Ayni version icin tekrar tetiklemede duplicate mail/event kontrolu
- Error handling degisikligi:
  - Beklenen HTTP status + error code semasi
