# Güvenlik, Kimlik Doğrulama & Oturum Mimarisi (Security & Auth Architecture)

Bu doküman, **secondHand** platformunda uygulanan **Stateless JWT & Oturum Yönetimi**, **Google OAuth2 SSO**, **OWASP Web Güvenliği Standartları (Security Headers & CORS/CSRF)**, **RBAC & IDOR Koruması**, **Brute-Force & Hız Sınırlama (Rate Limiting)** ve **Finansal Kriptografik Önlemleri** uçtan uca açıklamaktadır.

---

## 1. Genel Güvenlik Mimarisi ve Katmanlı Savunma (Defense-in-Depth)

Sistemimizde tek bir güvenlik katmanına güvenmek yerine **Katmanlı Savunma (Defense-in-Depth)** prensibi uygulanmıştır:

```
[İstemci / Tarayıcı]
         │
         ▼
[1. SecurityHeadersFilter] (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
         │
         ▼
[2. RateLimitingFilter] (IP & Token Bazlı DoS ve Hız Koruması)
         │
         ▼
[3. CorsFilter & CsrfCookieFilter] (Katı Origin Kuralları & Cookie CSRF Token)
         │
         ▼
[4. AuthenticationFilter (JWT)] (Stateless Token Doğrulama & SecurityContext)
         │
         ▼
[5. PublicEndpointRegistry & Method Security] (@PreAuthorize, RBAC & Sahiplik Doğrulaması)
         │
         ▼
[6. Kriptografik & Veri Katmanı Güvenliği] (BCrypt, SHA-256 OTP, Jackson Whitelist, Idempotency)
```

---

## 2. Kimlik Doğrulama & Oturum Yönetimi (Authentication & JWT)

### A. Çift Token Yaşam Döngüsü (Access & Refresh Token)
Uygulama tamamen **Stateless** çalışır (`SessionCreationPolicy.STATELESS`); sunucu tarafında memory session tutulmaz.

| Token Tipi | Geçerlilik Süresi | Saklandığı Yer | Kullanım Amacı |
| :--- | :--- | :--- | :--- |
| **Access Token** | **15 Dakika** (`900.000 ms`) | `Authorization: Bearer <token>` | API çağrılarında kimlik doğrulaması. Kısa ömürlü olması sızıntı riskini minimize eder. |
| **Refresh Token** | **7 Gün** (`604.800.000 ms`) | `HttpOnly`, `Secure`, `SameSite` Cookie | Access Token dolduğunda arayüzün sessizce yeni token alması. |
| **Remember-Me Refresh Token** | **30 Gün** (`2.592.000.000 ms`) | `HttpOnly`, `Secure`, `SameSite` Cookie | Kullanıcı "Beni Hatırla" seçtiğinde aktif olan uzun ömürlü token. |

---

### B. Refresh Token Rotation (RTR) & Otomatik İhlal Tespiti (Reuse Detection)
OAuth 2.0 Security BCP (Best Current Practice) standardı doğrultusunda **Refresh Token Rotation (RTR)** ve **Token Family** mimarisi uygulanmıştır ([`LoginService.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/auth/application/LoginService.java) & [`TokenService.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/auth/application/TokenService.java)):

```
[İstemci] ──(POST /api/auth/refresh-token)──► [LoginService]
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼ (Geçerli Token)                               ▼ (İptal Edilmiş / Bayat Token)
               [Yeni Access & Refresh Token Üret]             [🚨 REUSE DETECTION (İHLAL TESPİTİ)!]
               ├── Eski Token'ı REVOKED yap                   ├── Saldırgan veya sızdırılmış token kullanıldı!
               ├── Yeni Token'a familyId & parentId bağla     ├── tokenService.revokeTokenFamily(familyId)
               └── Yeni çerezi istemciye dön                  └── BÜTÜN Token Ailesi (Aktif Tüm Oturumlar) İptal Edilir!
```

1. **Tek Kullanımlık Refresh Token (Single-Use Token):**
   * Her token yenileme isteğinde (`POST /api/auth/refresh-token`), kullanılan eski refresh token veritabanında anında `REVOKED` statüsüne çekilir ve yerine tamamen yeni bir Refresh Token üretilir.
2. **Token Ailesi Takibi (`familyId` & `parentId`):**
   * İlk oturum açıldığında rastgele bir `UUID familyId` oluşturulur. Her rotasyon işleminde yeni token bu zincire (`parentId`) bağlanır.
3. **Otomatik İhlal Tespiti & Saldırı Engelleme (Reuse Detection):**
   * Eğer bir saldırgan çalınmış/eski bir refresh token'ı tekrar kullanmaya kalkarsa, `LoginService` bu token'ın daha önce `REVOKED` edildiğini anında yakalar:
     ```java
     if (!tokenService.isTokenValid(refreshTokenValue)) {
         tokenService.findByToken(refreshTokenValue).ifPresent(token -> {
             if (token.getFamilyId() != null) {
                 tokenService.revokeTokenFamily(token.getFamilyId());
                 log.warn("🚨 REUSE DETECTION: Revoked token was used! Revoked all tokens in family: {}", token.getFamilyId());
             }
         });
         throw InvalidRefreshTokenException.revoked();
     }
     ```
   * Sisteme anında alarm verilir ve ilgili `familyId`'ye bağlı **tüm aktif tokenlar topluca iptal edilir**. Böylece hem saldırganın hem de kullanıcının oturumu kapatılarak hesabın ele geçirilmesi (Account Takeover) %100 engellenir.
4. **Periyodik Token Temizliği (`cleanupExpiredTokens`):**
   * Süresi dolmuş tokenlar arka plan temizleme göreviyle düzenli olarak `EXPIRED` durumuna alınarak veritabanı performansı korunur.

---

### C. Google OAuth2 Social Login & SSO Boru Hattı ([`OAuth2LoginSuccessHandler.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/OAuth2LoginSuccessHandler.java))
1. Kullanıcı `/oauth2/authorization/google` üzerinden Google'a yönlendirilir.
2. Başarılı girişte `OAuth2LoginSuccessHandler` tetiklenir:
   - Kullanıcının e-postası sistemde varsa hesap eşleştirilir (`Account Linking`).
   - İlk kez geliyorsa yeni kullanıcı kaydı açılır ve `ROLE_USER` atanır.
   - Güvenli JWT üretilerek `HttpOnly` çereze yazılır ve ön yüze güvenli yönlendirme (`Redirect URI`) yapılır.

---

### D. Üretim Ortamı Güvenlik Muhafızı ([`ProdSecurityGuard.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/ProdSecurityGuard.java))
Uygulama `prod` profilinde ayağa kalkarken `PostConstruct` aşamasında kritik güvenlik denetimleri yapar; konfigürasyon güvensizse **sunucunun başlamasını engeller**:
* `jwt.secretKey` tanımlanmamışsa veya **32 karakterden kısaysa** uygulama çökertilir.
* `app.auth.cookie.secure = true` ve `same-site` zorunludur.
* CORS `allowed-origins` listesinde `localhost` veya wildcard `*` (credentials açıkken) varsa sistem durdurulur.

---

## 3. Web & Ağ Güvenliği (OWASP Standartları)

### A. Güvenlik Başlıkları ([`SecurityHeadersFilter.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/security/SecurityHeadersFilter.java))
Tüm HTTP yanıtlarına en yüksek öncelikle (`HIGHEST_PRECEDENCE`) aşağıdaki OWASP standart başlıkları enjekte edilir:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; ...
```
* **Clickjacking Koruması:** `X-Frame-Options: DENY` ile sitenin `<iframe>` içinde açılması engellenir.
* **MIME-Sniffing Koruması:** `X-Content-Type-Options: nosniff` ile dosya yüklemelerinde tarayıcının zararlı script çalıştırması önlenir.
* **HSTS:** 1 yıl boyunca tüm trafiğin HTTPS üzerinden akması garanti altına alınır.

---

### B. Dinamik Public Endpoint Keşfi ([`PublicEndpointRegistry.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/security/PublicEndpointRegistry.java))
* Controller'larda `@PublicEndpoint` anatasyonu taşıyan metotlar bootstrap anında taranır ve merkezi beyaz listeye eklenir.
* Yanlışlıkla korumasız endpoint kalması önlenir; açıkça izin verilmeyen her endpoint varsayılan olarak **Authentication Required** statüsündedir.

---

## 4. Yetkilendirme & Erişim Kontrolü (RBAC & IDOR Koruması)

### A. Role-Based Access Control (RBAC)
[`SecurityConfig.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/SecurityConfig.java) üzerinde `@EnableMethodSecurity` aktiftir:
* `@PreAuthorize("hasRole('ADMIN')")`: Yalnızca sistem yöneticilerine açık operasyonlar.
* `@PreAuthorize("hasRole('USER')")`: Standart kullanıcı endpointleri.

### B. IDOR (Insecure Direct Object Reference) ve Sahiplik Doğrulaması
Saldırganların URL'deki ID'yi değiştirerek başka kullanıcıların siparişlerini, tekliflerini veya cüzdanlarını görüntülemesini engellemek için **Sahiplik Doğrulama Katmanı** devrededir:
* `orderValidationService.validateOwnership(orderId, currentUser)`
* `offerValidator.isBuyerOrSeller(currentUser, offer)`
* Kullanıcı başkasına ait bir kaynağa erişmeye çalıştığında anında `403 FORBIDDEN` (`NOT_AUTHORIZED_FOR_ORDER`) fırlatılır.

---

## 5. Hız Sınırlama, Kaba Kuvvet (Brute-Force) & Anti-Abuse

| Korumalı Alan | Koruma Mekanizması | Detay |
| :--- | :--- | :--- |
| **Genel API İstekleri** | `RateLimitingFilter` | IP ve Token bazlı kayan pencere (sliding-window) limitleri ile DoS engelleme. |
| **Safe Meetup Teslimat Kodu** | 3 Hatalı Giriş Kilidi | 3 yanlış denemede sipariş `VERIFICATION_LOCKED` durumuna geçerek **15 dakika boyunca kilitlenir**. |
| **Aura AI Semantik Arama** | Rate Limiter | Yapay zeka maliyetlerini ve kaynak tüketimini korumak için kullanıcı başına **dakikada 12 istek** limiti. |
| **Stok Rezerve Etme (Hoarding)** | Redis 15 Dk TTL | Kullanıcının ürünü sepete atıp saatlerce ödeme yapmadan kilitlemesini engelleyen otomatik zaman aşımı. |

---

## 6. Kriptografi & Veri Bütünlüğü

### A. Parola Güvenliği
* Parolalar veritabanında asla açık tutulmaz; `BCryptPasswordEncoder(10)` ile tuzlanarak (salt) tek yönlü hash'lenir.

### B. Safe Meetup OTP Kriptografisi
* Yüz yüze teslimat için üretilen 6 haneli kod açık metin olarak değil, `SHA-256` hash'i (`meetupVerificationCodeHash`) olarak saklanır.

### C. Jackson RCE / Gadget Attack Koruması ([`CacheConfig.java`](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/core/config/CacheConfig.java))
Redis deserialization anında bilinmeyen zararlı Java sınıflarının yüklenmesini (Remote Code Execution) engellemek için `BasicPolymorphicTypeValidator` whitelist'i uygulanmıştır:
```java
BasicPolymorphicTypeValidator validator = BasicPolymorphicTypeValidator.builder()
        .allowIfSubType("com.serhat.secondhand")
        .allowIfSubType("java.util")
        .allowIfSubType("java.time")
        .allowIfSubType("java.lang")
        .allowIfSubType("java.math")
        .allowIfSubType("org.springframework.data.domain")
        .build();
```

---

## 7. Finansal & İş Mantığı Güvenlik Matrisi

| Güvenlik İhtiyacı | Çözüm Bileşeni | Engellenen Tehdit |
| :--- | :--- | :--- |
| **Çift Çekim / Mükerrer İstek** | `PaymentRedisIdempotencyService` (SETNX 120s) | Kullanıcının ödeme butonuna çift basması veya ağ retry'ında 2 kez para çekilmesi. |
| **Dual-Write Veri Kaybı** | Transactional Outbox Pattern | DB kaydedilip Kafka çöktüğünde paranın kaybolması veya stok düşümünün unutulması. |
| **Çifte Kafka Mesaj Tüketimi** | `ProcessedKafkaEvent` (PostgreSQL Deduplication) | Kafka rebalance sonrası aynı satıcıya 2 kez para aktarılması. |
| **Emanet (Escrow) İzolasyonu** | `PaymentStatus.ESCROW` | Ürün teslim edilmeden paranın satıcıya erken veya yetkisiz geçmesi. |
| **Negatif Cüzdan Bakiyesi** | `IEWalletService` Bakiye Validasyonu | Bakiyesi yetersiz kullanıcının açık vermesi veya eksiye düşmesi. |
