# Güvenlik, Kimlik Doğrulama ve Oturum Mimarisi

Bu doküman kimlik doğrulamanın (JWT, refresh token rotation, Google OAuth2), isteğin geçtiği güvenlik katmanlarının (header'lar, rate limit, CSRF, public endpoint keşfi) ve yetkilendirmenin nasıl çalıştığını anlatır. Kod blokları projeden alınmıştır. Modül özeti: [auth/README.md](../src/main/java/com/serhat/secondhand/auth/README.md).

İlgili dokümanlar: WebSocket güvenliği [websocket-stomp-and-chat-architecture.md](websocket-stomp-and-chat-architecture.md), prod kontrolleri [ci-cd-and-deployment-guide.md](ci-cd-and-deployment-guide.md#3-profiller-ve-prod-security-guard).

---

## 1. Bir isteğin geçtiği katmanlar

```
[Browser]
    │
    ▼
[SecurityHeadersFilter]      servlet filter, HIGHEST_PRECEDENCE: CSP, X-Frame-Options, HSTS ...
    │
    ▼
[RateLimitingFilter]         IP + kategori bazlı fixed window sayaç (Redis)
    │
    ▼
[CORS + CSRF]                izinli origin listesi; public olmayan yazma isteklerinde XSRF token
    │
    ▼
[AuthenticationFilter]       JWT: Authorization header ya da sh_at cookie → SecurityContext
    │
    ▼
[authorizeHttpRequests]      @PublicEndpoint route'ları permitAll, geri kalan her şey authenticated
    │
    ▼
[@PreAuthorize + sahiplik kontrolü]   rol ve "bu kayıt bu kullanıcının mı?" kontrolleri
```

Filter sırası [`SecurityConfig`](../src/main/java/com/serhat/secondhand/core/config/SecurityConfig.java) içinde tanımlıdır:

```java
.addFilterBefore(rateLimitingFilter, SecurityContextHolderFilter.class)
.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
.addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);
```

Oturum `SessionCreationPolicy.STATELESS`'tır; sunucuda HTTP session tutulmaz.

---

## 2. Token'lar

| Token | Ömür | Nerede taşınır | Not |
| :--- | :--- | :--- | :--- |
| Access token | 15 dk (`jwt.accessToken.expiration` = 900000 ms) | `sh_at` HttpOnly cookie; API client'ları için `Authorization: Bearer` da kabul edilir | Stateless JWT; DB'de saklanmaz. |
| Refresh token | 7 gün (604800000 ms) | `sh_rt` HttpOnly cookie | DB'de **SHA-256 hash'i** saklanır (`TokenService.hash`, V38). |
| Remember-me refresh token | 30 gün (2592000000 ms) | `sh_rt` HttpOnly cookie | Login'de `rememberMe=true` ise. |

Cookie'lerin `Secure`, `SameSite` ve domain değerleri `app.auth.cookie.*` ayarlarından gelir (varsayılan `secure=false`, `same-site=Lax`; prod'da `secure=true` zorunludur).

[`AuthenticationFilter`](../src/main/java/com/serhat/secondhand/core/jwt/AuthenticationFilter.java) önce header'a, yoksa cookie'ye bakar ve kullanıcıyı **DB'ye gitmeden** token claim'lerinden kurar:

```java
final String authHeader = request.getHeader("Authorization");
if (authHeader != null && authHeader.startsWith("Bearer ")) {
    jwt = authHeader.substring(7);
} else {
    jwt = cookieUtils.getAccessTokenFromCookies(request).orElse(null);
}
Claims claims = jwt != null ? jwtUtils.parseClaims(jwt) : null;   // istek başına tek imza kontrolü
...
if (accessRevocationService.isRevoked(userId, claims.getIssuedAt(), claims.getId())) {
    sendTokenError(response, request, TokenStatus.REVOKED);
    return;
}
```

Roller ve üyelik planı (`plan`, `planExpiry`) da claim'lerden okunur. Bu yüzden rol ya da plan değişikliği, kullanıcı yeni access token alana kadar (en fazla 15 dk) yansımaz.

### 2.1 Endpoint'ler

| Endpoint | Erişim | Ne yapar |
| :--- | :--- | :--- |
| `POST /api/v1/auth/register` | Public | Kayıt |
| `POST /api/v1/auth/login` | Public | Token çiftini üretir ve cookie'lere yazar |
| `POST /api/v1/auth/refresh` | Public (refresh cookie zorunlu) | Token rotation |
| `POST /api/v1/auth/logout` | Giriş yapmış | Refresh token'ı ve o anki access token'ı iptal eder, cookie'leri siler |
| `POST /api/v1/auth/revoke-all-sessions` | Giriş yapmış | Kullanıcının tüm refresh token'larını iptal eder |
| `GET /api/v1/auth/oauth2/google` | Public | `/oauth2/authorization/google`'a yönlendirir |
| `POST /api/v1/auth/oauth2/complete` | Public | Google ile gelen yeni kullanıcının kaydını tamamlar |
| `POST /api/v1/auth/passwords/forgot`, `/reset` | Public | Şifre sıfırlama |
| `PUT /api/v1/auth/passwords/change` | Giriş yapmış | Şifre değiştirme |

---

## 3. Refresh token rotation ve reuse detection

Her refresh'te eski token iptal edilir ve yenisi aynı aileye (`familyId`) bağlanır. İptal edilmiş bir token tekrar gelirse bu çalınma işareti sayılır ve **tüm aile** iptal edilir.

```
POST /api/v1/auth/refresh  (sh_rt cookie)
        │
        ├─ JWT imzası / süresi geçersiz ─────────► 401 (invalid)
        ├─ DB'de ACTIVE değil ───────────────────► aileyi iptal et, 401 (revoked)   ← reuse detection
        ├─ Hesap ACTIVE değil ───────────────────► reddedilir
        ├─ claimForRotation kaybedildi ──────────► 401 (revoked), aile iptal EDİLMEZ
        └─ Başarılı ─────────────────────────────► yeni access + refresh, cookie'ler güncellenir
```

[`LoginService.refreshToken`](../src/main/java/com/serhat/secondhand/auth/application/LoginService.java):

```java
if (!tokenService.isTokenValid(refreshTokenValue)) {
    tokenService.findByToken(refreshTokenValue).ifPresent(token -> {
        if (token.getFamilyId() != null) {
            log.warn("Security Alert: Token reuse detected for user {}. Revoking token family.", username);
            tokenService.revokeTokenFamily(token.getFamilyId());
        }
    });
    throw InvalidRefreshTokenException.revoked();
}
...
// Aynı token ile eşzamanlı iki refresh: yalnızca koşullu UPDATE'i kazanan rotate eder.
if (!tokenService.claimForRotation(oldRefreshToken)) {
    throw InvalidRefreshTokenException.revoked();
}
TokenRotationResult tokens = rotateTokens(user, oldRefreshToken.isRememberMe(), oldRefreshToken);
```

- Metot `@Transactional(noRollbackFor = InvalidRefreshTokenException.class)` ile işaretlidir; aile iptali, ardından fırlatılan exception yüzünden geri alınmaz.
- İki sekmenin aynı anda refresh atması meşru bir durumdur; bu yüzden yarışı kaybeden istek reddedilir ama aile iptal edilmez.
- Engellenmiş ya da kapatılmış hesap, geçerli refresh token'ı olsa da yeni access token alamaz.
- **Temizlik:** [`TokenCleanupScheduler`](../src/main/java/com/serhat/secondhand/auth/application/TokenCleanupScheduler.java) 5 dakikada bir süresi dolan token'ları `EXPIRED` yapar ve saklama süresini geçmiş satırları siler.

### 3.1 Access token'ı anında geçersiz kılma

Access token stateless olduğu için refresh token'ı iptal etmek, verilmiş access token'ı 15 dakika boyunca çalışır bırakır. [`AccessRevocationService`](../src/main/java/com/serhat/secondhand/auth/application/AccessRevocationService.java) bunu Redis ile kapatır:

| Key | Ne zaman yazılır | TTL | Etkisi |
| :--- | :--- | :--- | :--- |
| `auth:access-token-revoked:{jti}` | Logout | Token'ın kalan ömrü | Yalnızca o token reddedilir; diğer oturumlar çalışır. |
| `auth:access-revoked:{userId}` | `revokeAllAccess` (hesap engelleme vb.) | Bir access token ömrü | Bu andan önce üretilmiş tüm access token'lar reddedilir. |

`isRevoked` iki key'i tek `MGET` ile okur. Aynı kontrol WebSocket CONNECT, SUBSCRIBE ve SEND frame'lerinde de çalışır.

---

## 4. Login throttling

[`LoginAttemptService`](../src/main/java/com/serhat/secondhand/auth/application/LoginAttemptService.java) başarısız girişleri Redis'te sayar; sayaçlar tüm instance'lar arasında ortaktır.

```java
static final int MAX_FAILURES_PER_ACCOUNT_AND_IP = 5;
static final int MAX_FAILURES_PER_IP = 20;
static final Duration WINDOW = Duration.ofMinutes(15);
```

| Sayaç | Key | Limit |
| :--- | :--- | :--- |
| Hesap + IP | `auth:login-fail:account:{email}:{ip}` | 15 dk'da 5 hata |
| IP (tüm hesaplar) | `auth:login-fail:ip:{ip}` | 15 dk'da 20 hata |

- Limit aşılınca login `ACCOUNT_LOCKED` (429) döner.
- Sayaç hesap **ve** IP çiftine bağlıdır: saldırgan yalnızca kendi IP'sini kilitler, gerçek hesap sahibini başka IP'den kilitleyemez.
- Başarılı giriş yalnızca hesap sayacını siler; IP sayacı kalır.

---

## 5. Google OAuth2

Akış [`OAuth2LoginSuccessHandler`](../src/main/java/com/serhat/secondhand/core/config/OAuth2LoginSuccessHandler.java) içindedir:

1. Kullanıcı `/oauth2/authorization/google` üzerinden Google'a gider.
2. Google `email_verified` döndürmüyorsa ya da e-posta yoksa giriş reddedilir.
3. **E-posta kayıtlıysa:** hesap `ACTIVE` olmalıdır. Yeni bir token ailesiyle oturum açılır, cookie'ler yazılır ve `{frontend}/?oauth_success=true` adresine yönlendirilir. Hesabın provider'ı değiştirilmez (LOCAL hesap LOCAL kalır).
4. **E-posta kayıtlı değilse:** kullanıcı otomatik oluşturulmaz. Kısa ömürlü, imzalı bir `registrationToken` üretilir ve frontend'e URL **fragment**'ında verilir:
   ```java
   String redirectUrl = String.format("%s/auth/complete#registrationToken=%s",
           appConfigProperties.getFrontendUrl(), urlEncode(registrationToken));
   ```
   Fragment sunucuya ve `Referer` header'ına gitmediği için token access log'lara düşmez. Frontend eksik alanları toplayıp `POST /api/v1/auth/oauth2/complete` çağırır; backend kimliği yalnızca bu token'dan alır.

---

## 6. Public endpoint keşfi

Varsayılan kural "her şey kimlik ister"dir. Bir endpoint'i açmak için controller metoduna `@PublicEndpoint` konur; elle tutulan bir URL listesi yoktur.

- [`PublicEndpointRegistry`](../src/main/java/com/serhat/secondhand/core/security/PublicEndpointRegistry.java) açılışta tüm controller route'larını (HTTP metodu + path pattern) tarar.
- [`PublicRouteRequestMatcher`](../src/main/java/com/serhat/secondhand/core/security/PublicRouteRequestMatcher.java) isteği, Spring MVC'nin seçeceği route'a göre değerlendirir (önce en özgül pattern, sonra metot). Bu sayede public `GET /api/v1/listings/{id}`, korumalı `GET /api/v1/listings/my` ya da `PUT /api/v1/listings/{id}` route'larını açmaz. Eşit özgüllükte biri public biri korumalıysa istek korumalı kalır.
- Aynı matcher hem `permitAll` hem CSRF muafiyeti için kullanılır.
- Controller'ı olmayan altyapı yolları ayrıca açıktır: `/oauth2/**`, `/login/oauth2/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/ws/**`, `/actuator/health/**`, `/actuator/info`. `/actuator/prometheus` bilerek bu listede değildir.

**CSRF:** Token `CookieCsrfTokenRepository.withHttpOnlyFalse()` ile cookie'de tutulur; frontend bunu `X-XSRF-TOKEN` header'ında geri gönderir. Public route'lar muaftır.

Kimliksiz bir `/api/` isteği 401 JSON (`{"error":"UNAUTHORIZED", ...}`), yetkisiz istek 403 JSON döner.

---

## 7. Rate limiting

Ayrıntılı analiz, CIDR IP sahtecilik koruması, iki aşamalı login kilitleri ve Fail-Closed sözleşmesi: [rate-limiting-and-throttling-architecture.md](rate-limiting-and-throttling-architecture.md).

[`RateLimitingFilter`](../src/main/java/com/serhat/secondhand/core/security/RateLimitingFilter.java) IP ve kategori bazında **fixed window** sayaç tutar. Sayaç Redis'tedir, tüm instance'lar paylaşır.

```java
int maxRequestsPerWindow = requestsPerSecond * windowSeconds;
long windowIndex = now / windowMillis;
String key = KEY_PREFIX + category.name + ":" + clientIp + ":" + windowIndex;   // ratelimit:auth:1.2.3.4:28912345
Long result = redisTemplate.execute(windowScript, List.of(key), String.valueOf(windowMillis));
```

`rate_limit_window.lua`:

```lua
local count = redis.call('INCR', KEYS[1])
if count == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
```

| Kategori | Path | Varsayılan | 60 sn'lik pencerede |
| :--- | :--- | :--- | :--- |
| `payment` | `/api/payment`, `/api/v1/payments` | `RATE_LIMIT_PAYMENT` | 10 |
| `auth` | `/api/auth/`, `/api/v1/auth/` | `RATE_LIMIT_AUTH` | 20 |
| `ai` | `/api/ai/`, `/api/v1/ai/` | `RATE_LIMIT_AI` | 15 |
| `general` | diğer her şey | `RATE_LIMIT_GENERAL` | 150 |

- Limit aşılınca 429 döner; `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` header'ları yazılır.
- **Redis'e ulaşılamazsa istek 503 ile reddedilir**; limitsiz geçirilmez.
- `OPTIONS`, `/swagger-ui`, `/v3/api-docs`, `/ws/` ve `/actuator/` filtrelenmez.
- Client IP'si `ClientIpResolver` ile bulunur; `X-Forwarded-For` yalnızca `app.rate-limit.trusted-proxies` listesindeki peer'lardan geliyorsa dikkate alınır.
- Değerler `RATE_LIMIT_*` ortam değişkenleriyle değişir ([ci-cd dokümanı](ci-cd-and-deployment-guide.md#2-ortam-değişkenleri-env)).

### Diğer kötüye kullanım korumaları

| Alan | Koruma |
| :--- | :--- |
| Login | Hesap+IP ve IP sayaçları (§4). |
| Safe Meetup kodu | 3 hatalı denemede sipariş 15 dk `VERIFICATION_LOCKED` ([detay](safe-meetup-delivery-and-verification.md)). |
| Aura ilan araması | Kullanıcı başına dakikada 12 arama planı (`aura.agent.search.rate-limit-per-minute`). Sayaç JVM içindedir, instance'lar arasında paylaşılmaz. |
| Checkout stok tutma | Rezervasyon 15 dk sonra düşer ([detay](stock-reservation-and-reconciliation.md)). |

---

## 8. Güvenlik header'ları

[`SecurityHeadersFilter`](../src/main/java/com/serhat/secondhand/core/security/SecurityHeadersFilter.java) her cevaba şunları yazar:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), ...
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                         img-src 'self' data: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src ...;
                         object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` yalnızca istek HTTPS ise (`request.isSecure()`) eklenir.
- CSP'nin `connect-src` kısmı CORS origin listesinden ve bunların `ws`/`wss` karşılıklarından üretilir.

**CORS:** İzinli origin, metot ve header listeleri `app.cors.*` ayarlarından gelir; wildcard kullanılmaz. Prod'da listede `localhost` bulunamaz.

---

## 9. Yetkilendirme

### Rol kontrolü
`@EnableMethodSecurity` açıktır. Kod tabanında iki ifade kullanılır: `@PreAuthorize("isAuthenticated()")` ve yönetici endpoint'lerinde `@PreAuthorize("hasRole('ADMIN')")` (kupon yönetimi, audit log vb.).

### Sahiplik kontrolü (IDOR)
URL'deki id'yi değiştirerek başkasının kaydına erişmeyi engelleyen kontroller servis katmanındadır; controller yalnızca `@AuthenticationPrincipal` kullanıcısını geçirir.

| Kaynak | Kontrol | Hata kodu |
| :--- | :--- | :--- |
| Sipariş | `OrderValidationService.validateOwnership` | `ORDER_NOT_BELONG_TO_USER` |
| Safe Meetup doğrulama / QR | Satıcı ya da alıcı kontrolü (`OrderCompletionService`) | `NOT_AUTHORIZED_FOR_ORDER` |
| Teklif | `OfferValidator.isBuyerOrSeller` + `isReceiver` | `OFFER_NOT_ALLOWED` |
| Bildirim | `NotificationService.markAsRead` | `NOTIFICATION_NOT_BELONGS_TO_USER` |
| Chat odası | `ChatAuthorizationService.validateRoomParticipant` | subscription reddi |

---

## 10. Kriptografi ve veri bütünlüğü

- **Parola:** `BCryptPasswordEncoder(10)`.
- **Refresh token:** DB'de SHA-256 hash'i. Token zaten yüksek entropili imzalı bir JWT olduğu için tuzsuz hash yeterlidir.
- **JWT imza anahtarı:** `JWT_SECRET_KEY` base64 kodludur; prod'da decode edilince en az 32 byte olmalıdır.
- **Redis cache deserialization:** [`CacheConfig`](../src/main/java/com/serhat/secondhand/core/config/CacheConfig.java) `@class` ile tip taşıyan JSON kullanır; yalnızca izinli paketlerdeki tipler deserialize edilir (gadget saldırılarına karşı):
  ```java
  BasicPolymorphicTypeValidator validator = BasicPolymorphicTypeValidator.builder()
          .allowIfSubType("com.serhat.secondhand")
          .allowIfSubType("java.util")
          .allowIfSubType("java.time")
          .allowIfSubType("java.lang")
          .allowIfSubType("java.math")
          .allowIfSubType("org.springframework.data.domain")
          .allowIfSubTypeIsArray()
          .build();
  ```
- **Kafka deserialization:** `JsonDeserializer` yalnızca `com.serhat.secondhand.*` paketlerine güvenir.

## 11. Prod Security Guard

[`ProdSecurityGuard`](../src/main/java/com/serhat/secondhand/core/config/ProdSecurityGuard.java) `prod` profilinde açılışta JWT anahtarını, rate limit'in açık olduğunu, actuator exposure listesini, cookie ve CORS ayarlarını kontrol eder; biri uygunsuzsa uygulama başlamaz. Kontrol listesi: [ci-cd dokümanı §3](ci-cd-and-deployment-guide.md#3-profiller-ve-prod-security-guard).

## 12. Para akışındaki güvenlik önlemleri

| İhtiyaç | Çözüm | Ayrıntı |
| :--- | :--- | :--- |
| Çift çekim | Redis `SET NX` idempotency kaydı (1 saat / 24 saat) + DB `idempotencyKey` kontrolü | [payment](payment-strategy-and-provider-extension-guide.md) |
| DB yazıldı, Kafka'ya gidemedi | Transactional Outbox | [redis-kafka](redis-and-kafka-architecture.md) |
| Aynı Kafka mesajının iki kez işlenmesi | `processed_kafka_events` | [redis-kafka](redis-and-kafka-architecture.md) |
| Paranın teslimden önce satıcıya geçmesi | `PaymentStatus.ESCROW` | [escrow](escrow-lifecycle-and-state-machine.md) |
| Ödeme onayı | E-posta ile gönderilen doğrulama kodu (`PAYMENT_VERIFICATION_REQUIRED`) | [payment §3.5](payment-strategy-and-provider-extension-guide.md) |
