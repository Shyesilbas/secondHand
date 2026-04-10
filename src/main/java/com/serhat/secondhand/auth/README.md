# Auth Paketi Teknik Rehber

Bu dokumanin amaci:
- `auth` paketinin sorumluluklarini tek yerde netlestirmek
- Degisikliklerde davranissal regresyon ve guvenlik riskini azaltmak

## 1) Paket Amaci ve Sinirlari

`auth` paketi, kullanici kimlik dogrulama ve oturum surecleriyle ilgilenir.

Kapsam:
- Kayit (`register`)
- Giris (`login`)
- Cikis (`logout`)
- Refresh token rotasyonu
- OAuth kayit tamamlama
- Sifre degistirme/sifirlama
- Refresh token persistence ve revoke/cleanup

Kapsam disi:
- Kullanici profil is kurallari (`user` paketi)
- JWT'nin teknik uretim/parsing detayi (`core.jwt.JwtUtils`)
- Cookie policy alt seviye yardimcilari (`core.security.CookieUtils`)

## 2) Paket Yapisi (Nerede Ne Var)

- `api/AuthController.java`
  - Auth endpoint giris noktasi.
  - Cookie set/clear ve service delegasyonu yapar.

- `api/PasswordController.java`
  - Sifre endpoint giris noktasi.
  - `change`, `forgot`, `reset` akislarini `PasswordService`e delege eder.

- `application/IAuthService.java`
  - Auth service kontrati.
  - Controller bu interface uzerinden calisir.

- `application/AuthService.java`
  - Auth is kurallarinin ana orkestrasyon katmani.
  - Register, login, refresh, logout, OAuth tamamlamayi yonetir.

- `application/PasswordService.java`
  - Sifre degistirme ve sifre sifirlama kurallari.
  - Verification code ile reset dogrulamasi burada.

- `application/TokenService.java`
  - Token kaydetme, revoke, cleanup ve status dogrulama.
  - Bulk update querylerini buradan cagirir.

- `application/TokenCleanupScheduler.java`
  - Periyodik token cleanup tetikleyicisi.
  - `TokenService.cleanupExpiredTokens()` cagirir.

- `application/UserDetailsServiceImpl.java`
  - Spring Security `UserDetailsService` implementasyonu.
  - Login icin kullaniciyi email ile yukler.

- `domain/entity/Token.java`
  - Refresh token persistence modeli.
  - `id` tipi `UUID`.

- `domain/repository/TokenRepository.java`
  - Token sorgulari + bulk status update queryleri.

- `domain/dto/request/*`
  - API request kontratlari.

- `domain/dto/response/*`
  - API response kontratlari.

- `domain/exception/*`
  - Auth domain exception tipleri.

- `util/AuthErrorCodes.java`
  - Auth hata kodlari ve status standardi.

## 3) Katmanlar Arasi Akis

Standart akis:
1. `Controller` request alir, validasyon yapar.
2. `Service` is kurallarini uygular.
3. `Repository` persistence islemini yapar.
4. `Service` sonucu DTO/response formatina getirir.
5. `Controller` HTTP response dondurur.

Login akis ozeti:
1. `AuthController.login` -> `AuthService.login`
2. `AuthenticationManager` credentials dogrular
3. User bulunur, account status kontrol edilir
4. Eski refresh tokenlar revoke edilir
5. Yeni access/refresh token uretilir ve kaydedilir
6. Cookie'ler set edilir, response donulur

Refresh akis ozeti:
1. Refresh token cookie'den okunur
2. JWT + DB token status birlikte dogrulanir
3. Eski token revoke edilir
4. Yeni token cifti uretilir ve kaydedilir
5. Cookie yenilenir

## 4) Kritik Is Kurallari

- Register akisi:
  - Unique user dogrulamasi zorunlu.
  - `agreementsAccepted` true olmali.
  - Zorunlu agreement ID'leri kabul listesinde olmali.
  - Agreement dogrulamasi persistence oncesi yapilir.

- Login akisi:
  - Credentials dogrulamasi `AuthenticationManager` uzerinden yapilir.
  - Hesap `ACTIVE` degilse login engellenir.

- Refresh akisi:
  - Token bos/null olamaz.
  - JWT dogrulamasi + DB status dogrulamasi birlikte kosulur.
  - Rotasyon yapilir: eski refresh revoke, yeni refresh kaydet.

- Password reset akisi:
  - Verification code zorunlu ve aktif olmalı.
  - Hatali kodda deneme hakki duser.
  - `newPassword` ile `confirmPassword` esit olmalidir.
  - Yeni sifre mevcut sifreyle ayni olamaz.

## 5) Token Modeli ve Repository Notlari

`Token` entity:
- `id`: `UUID`
- `tokenType`: `REFRESH_TOKEN` gibi tip bilgisi
- `tokenStatus`: `ACTIVE`, `REVOKED`, `EXPIRED`
- `familyId` ve `parentId`: refresh token family/rotation takibi
- `rememberMe`: refresh suresi davranisini etkiler

`TokenRepository`:
- Basit lookup methodlari vardir (`findByToken`, `findByUser...`).
- Bulk update methodlari vardir:
  - Kullanici + tip + mevcut status bazli toplu status guncelleme
  - Kullanici + mevcut status bazli toplu status guncelleme
  - Expiry zamanina gore toplu expire islemi
- Bu methodlar otomatik tetiklenmez; `TokenService` tarafindan cagrilir.

## 6) Konfigurasyon Haritasi

`application.yml`:
- `jwt.secretKey`
- `jwt.accessToken.expiration`
- `jwt.refreshToken.expiration`
- `jwt.refreshToken.rememberMeExpiration`
- `app.auth.cookie.domain`
- `app.auth.cookie.secure`
- `app.auth.cookie.same-site`

Not:
- `TokenCleanupScheduler` su anda sabit `fixedRate` kullanir.
- Bu degeri konfigurasyona tasimak istenirse scheduler annotation'i property tabanli guncellenmeli.

## 7) Endpoint Haritasi

Taban yol: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /refresh`
- `GET /oauth2/google`
- `POST /oauth2/complete`
- `POST /revoke-all-sessions`
- `GET /validate` (deprecated)

Sifre taban yol: `/api/auth/password`
- `PUT /change`
- `POST /forgot`
- `POST /reset`

## 8) Bilincli Davranis Kararlari

- `forgotPassword` endpointinde `verificationCode` response'a donulur.
  - Bu davranis bilincli olarak korunmustur.
  - Uretim ortaminda acik kalmasi guvenlik karari gerektirir; degistirmek istenirse once urun/security karari alin.

## 9) Siklikla Yapilan Degisiklikler ve Yol Haritasi

### A) Yeni auth hatasi eklemek
1. `AuthErrorCodes` icine yeni kodu ekle.
2. Service katmaninda bu kodu kullan.
3. Hardcoded code/message ekleme.

### B) Register kurali degistirmek
1. `AuthService.register` icindeki kontrol sirasini bozma.
2. Persist oncesi zorunlu dogrulamalari tamamla.
3. Agreement ile ilgili degisiklikte `AgreementRequirementService` kontratini da kontrol et.

### C) Token davranisi degistirmek
1. `TokenService` methodunu guncelle.
2. Gerekirse `TokenRepository` query'sini revize et.
3. Bulk update davranisinda transaction sinirini koru.

### D) Password reset kurali degistirmek
1. `PasswordService.resetPassword` icinde verification + sifre kurallarini birlikte ele al.
2. `ResetPasswordRequest` validasyon kontratini bozma.
3. Confirm password kontrolunu devre disi birakma.

### E) OAuth akisini degistirmek
1. `AuthService.completeOAuthRegistration` icinde save sonucunu mutlaka kontrol et.
2. Persist basarisizken token mint etme.

## 10) Performans ve Guvenlik Notlari

- Revoke/cleanup operasyonlarinda satir satir save yerine bulk update tercih edilir.
- Login icinde duplicate credential kontrolu yapma; `AuthenticationManager` tek kaynak olmalı.
- Refresh token dogrulamasinda sadece JWT'ye guvenme; DB status kontrolu zorunlu.
- Auth kodunda magic number/hardcoded hata kodu dagitma.

## 11) AI Ajanlari Icin Hizli Protokol

Bu pakette otomatik degisiklik yapan ajanlar su sirayi izlemeli:
1. `Controller -> Service -> Repository -> DTO/Exception` akisini oku.
2. Request/response kontrati degisiyorsa ilgili controller ve DTO'lari birlikte guncelle.
3. Yeni auth hata durumlarinda `AuthErrorCodes` kullan.
4. Token status degisikligini `TokenService` uzerinden yonet.
5. Refresh/login akisi degistiyse cookie ve token rotasyon davranisini birlikte kontrol et.
6. Bilincli korunmus davranislari (verification code donusu gibi) izinsiz kaldirma.

## 12) Degisiklik Oncesi/Sonrasi Checklist

Degisiklik oncesi:
- Etkilenen endpoint ve service methodunu netlestir
- Token persistence veya agreement kuralina etkisini not et
- Error code standardina etkisini belirle

Degisiklik sonrasi:
- Derleme/lint durumunu kontrol et
- Login/refresh/logout akisini davranissal test et
- Password reset akisinda code + confirm password senaryosunu test et
- Register akisinda zorunlu agreement eksigi senaryosunu test et

Bu rehber korunursa `auth` paketi daha ongorulebilir, bakimi kolay ve regresyona daha direncli kalir.
