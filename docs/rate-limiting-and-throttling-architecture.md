# Rate Limiting, Throttling ve Kötüye Kullanım Önleme Mimarisi

Bu doküman, secondHand platformundaki tüm hız sınırlama (rate limiting), brute-force throttling, kullanıcı ve AI kota yönetimi ile kötüye kullanım önleme (anti-abuse) mekanizmalarını anlatır. Kod blokları ve anahtarlar birebir projedeki kaynak koddan alınmıştır.

---

## 1. Mimariye Genel Bakış ve Savunma Katmanları

Platform genelinde tek tip bir hız sınırlayıcı yerine, tehlike modeline ve işlevin maliyetine göre tasarlanmış **çok katmanlı (multi-tier)** bir koruma mimarisi işletilir:

```
                  Client İsteği (HTTP / REST)
                              │
  [Katman 1: Edge/Filter]     ▼
┌────────────────────────────────────────────────────────┐
│ RateLimitingFilter (HIGHEST_PRECEDENCE)               │
│ - Dağıtık Redis Fixed-Window (rate_limit_window.lua)   │
│ - ClientIpResolver (Güvenli IP çözümleme & CIDR kontrol)│
│ - Kategori bazlı sınırlar (Auth: 20, Pay: 10, AI: 15, Gen: 150)│
│ - Fail-Closed: Redis çökerse 503 Service Unavailable   │
└─────────────────────────────┬──────────────────────────┘
                              │ (Geçiş izni)
  [Katman 2: Kimlik Güvenliği] ▼
┌────────────────────────────────────────────────────────┐
│ LoginAttemptService (Kimlik Doğrulama Throttling)      │
│ - Tier 1: Hesap + IP bazlı kilit (15 dk, maks 5 hata)   │
│ - Tier 2: IP bazlı genel kilit (15 dk, maks 20 hata)   │
│ - DoS ve Credential Spraying engelleme                 │
└─────────────────────────────┬──────────────────────────┘
                              │
  [Katman 3: İş & Alan Mantığı]▼
┌────────────────────────────────────────────────────────┐
│ Domain-Spesifik Hız ve Kötüye Kullanım Kilitleri       │
│ - Safe Meetup: 30 sn kod yenileme cooldown sınırı      │
│ - Safe Meetup: 3 hatalı OTP denemesinde 15 dk kilit    │
│ - Aura AI Arama: Kullanıcı başına dakikada 12 arama    │
│ - Aura AI Günlük Kota: Veritabanı atomik slot rezervi  │
│ - Gemini LLM 429: Exponential backoff & retry          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Katman 1: Global HTTP Rate Limiting (`RateLimitingFilter`)

### 2.1 Konum ve Filtre Önceliği
`RateLimitingFilter`, Spring Security zincirinin en başında, `SecurityContextHolderFilter` sınıfından bile önce çalışır ([`SecurityConfig.java`](../src/main/java/com/serhat/secondhand/core/config/SecurityConfig.java#L114)):

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter extends OncePerRequestFilter { ... }
```

Bu öncelik sayesinde yetkisiz veya kötü niyetli istekler henüz JWT doğrulaması, veritabanı kullanıcı sorgusu veya CSRF kontrolü yapılmadan en erken aşamada kesilir; böylece veritabanı bağlantı havuzu (connection pool) ve CPU kaynakları korunur.

### 2.2 İstisna / Bypass Edilen İstekler (`shouldNotFilter`)
Aşağıdaki istek tipleri rate limiting filtresinden muaf tutulur ([`RateLimitingFilter.java`](../src/main/java/com/serhat/secondhand/core/security/RateLimitingFilter.java#L57-L73)):
1. `app.rate-limit.enabled=false` ise tüm istekler.
2. `OPTIONS` HTTP metodu (CORS preflight istekleri tarayıcı tarafından otomatik atıldığı için sınırlandırılmaz).
3. Swagger / OpenAPI dokümantasyonu: `/swagger-ui/**`, `/api-docs/**`, `/v3/api-docs/**`.
4. WebSocket STOMP endpoint'i: `/ws/**` (WebSocket kendi kanal seviyesinde güvenlik denetimine tabidir).
5. Spring Boot Actuator: `/actuator/**` (Prometheus ve sağlık kontrolleri yönetim portu üzerinden ayrı izlenir).

### 2.3 Dağıtık Sayaç ve Atomik Lua Script'i
Sayaçlar, kümedeki (cluster) tüm pod ve node'ların ortak eriştiği Redis üzerinde `rate_limit_window.lua` ile atomik olarak yönetilir:

```lua
-- scripts/rate_limit_window.lua
local count = redis.call('INCR', KEYS[1])
if count == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
```

- **Redis Anahtarı:** `ratelimit:<kategori>:<clientIp>:<windowIndex>`
- **Window Index Hesabı:** `windowIndex = System.currentTimeMillis() / windowMillis`
- **Sıfırlanma Zamanı (Reset):** `resetAt = (windowIndex + 1) * windowMillis`
- **PEXPIRE:** İlk artışta pencere süresi (`windowMillis`) kadar milisaniye TTL atanır.

### 2.4 Kategori Matrisi ve Varsayılan Limitler
İstek URI'sine göre 4 kategoriye ayrılır ([`RateLimitingFilter.java`](../src/main/java/com/serhat/secondhand/core/security/RateLimitingFilter.java#L128-L140)):

| Kategori | Hedef URI Örüntüsü | Varsayılan Pencere Limiti | 60 sn Pencere Başına Maksimum İstek |
| :--- | :--- | :--- | :--- |
| **`PAYMENT`** | `/api/payment/**`, `/api/v1/payments/**`, `/api/v1/test/rate-limits/payment` | 10 istek / 60 sn (`RATE_LIMIT_PAYMENT`) | 10 istek / 60 sn |
| **`AUTH`** | `/api/auth/**`, `/api/v1/auth/**` | 20 istek / 60 sn (`RATE_LIMIT_AUTH`) | 20 istek / 60 sn |
| **`AI`** | `/api/ai/**`, `/api/v1/ai/**` | 15 istek / 60 sn (`RATE_LIMIT_AI`) | 15 istek / 60 sn |
| **`GENERAL`** | Yukarıdakiler dışındaki tüm API endpoint'leri | 150 istek / 60 sn (`RATE_LIMIT_GENERAL`) | 150 istek / 60 sn |

> [!NOTE]
> Varsayılan pencere süresi `app.rate-limit.window-size-seconds` parametresiyle kontrol edilir ve varsayılan olarak **60 saniyedir** (`RATE_LIMIT_WINDOW`). Limitler pencere başına doğrudan yapılandırılır (`limit`), geriye dönük uyumluluk için `requests-per-second` tanımlanmışsa `requestsPerSecond * windowSeconds` formülü işletilir.

### 2.5 Hata Durumları ve Protokol Sözleşmesi

#### HTTP 429 Too Many Requests (Limit Aşıldığında)
Limit aşıldığında filtre zinciri kırılır ve client'a aşağıdaki standart header'lar ve JSON yanıtı ile dönülür:

**HTTP Response Headers:**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json;charset=UTF-8
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1762767240000
Retry-After: 42
```

**JSON Body:**
```json
{
    "timestamp": "2026-11-10T12:00:00.000",
    "status": 429,
    "error": "Too Many Requests",
    "message": "Rate limit exceeded. Maximum 20 requests per 60 seconds allowed for this endpoint type.",
    "path": "/api/v1/auth/login",
    "retryAfter": 42
}
```

#### HTTP 503 Service Unavailable (Fail-Closed Güvenlik İlkesi)
Redis erişilemez olduğunda (`DataAccessException` veya `RedisConnectionFailureException`), filtre **fail-closed** çalışır. Kötü niyetli bir saldırganın Redis'i DoS ile devre dışı bırakıp uygulamayı limitsiz sömürmesini engellemek için istekler doğrudan 503 ile reddedilir:

```json
{
    "timestamp": "2026-11-10T12:00:00.000",
    "status": 503,
    "error": "Service Unavailable",
    "message": "Rate limiter is unavailable. Please retry shortly.",
    "path": "/api/v1/listings"
}
```

---

## 3. Client IP Çözümleme ve Sahtecilik Koruması (`ClientIpResolver`)

Rate limiting mekanizmasının güvenliği, client'ın gerçek IP'sinin doğru tespit edilmesine bağlıdır. Sahte `X-Forwarded-For` header enjeksiyonunu engellemek için [`ClientIpResolver.java`](../src/main/java/com/serhat/secondhand/core/security/ClientIpResolver.java) özel bir algoritma uygular:

### 3.1 Sağdan Sola (Right-to-Left) Atlama Analizi
Client doğrudan dışarıdan rastgele bir `X-Forwarded-For: 1.2.3.4` başlığı gönderebilir. Bu nedenle:
1. İsteği uygulamaya doğrudan teslim eden eşin (`request.getRemoteAddr()`) güvenilir bir reverse-proxy olup olmadığı kontrol edilir (`trustedProxies`).
2. Eğer doğrudan bağlantı güvenilir proxy değilse, `X-Forwarded-For` başlığı tamamen yok sayılır ve doğrudan `remoteAddr` kullanılır.
3. Bağlantı güvenilir bir proxy'den geliyorsa, `X-Forwarded-For` zinciri **sağdan sola (en son proxy'den geriye doğru)** taranır.
4. Güvenilir proxy listesinde yer almayan ilk IP adresi, client'ın gerçek IP'si olarak kabul edilir. Bu noktanın solundaki tüm girdiler client'ın kendisi tarafından yazılmış olabileceğinden dikkate alınmaz.

```
Client (203.0.113.9) ---> Nginx Proxy (10.0.0.5) ---> Spring Boot (10.0.0.9)
Header: X-Forwarded-For: sahte-ip, 203.0.113.9
Spring Boot analizi:
1. remoteAddr = 10.0.0.5 (Güvenilir proxy mi? EVET: 10.0.0.0/8 içinde)
2. Sağdan sola tara: 203.0.113.9 (Güvenilir proxy mi? HAYIR -> Gerçek Client = 203.0.113.9)
```

### 3.2 Güvenilen Proxy CIDR Blokları
Varsayılan güvenilen CIDR listesi (`app.rate-limit.trusted-proxies`):
- `127.0.0.0/8` (IPv4 Loopback)
- `::1/128` (IPv6 Loopback)
- `10.0.0.0/8` (Private Class A)
- `172.16.0.0/12` (Private Class B - Docker varsayılan ağları)
- `192.168.0.0/16` (Private Class C)
- `fc00::/7` (IPv6 Unique Local)

### 3.3 DNS Lookup DoS Koruması
Header içinde IP adresi yerine alan adı (`evil.example.com`) enjekte edilirse, `ClientIpResolver` DNS çözümlemesi yapmaz; regex ile IP literal kontrolü (`IPV4` ve `IPV6` pattern) yaparak format dışı girdileri anında eler ve `remoteAddr`'a geri döner. Bu sayede DNS çözümleme gecikmesiyle worker thread'lerin kilitlenmesi önlenir.

---

## 4. Katman 2: Kimlik Doğrulama Throttling (`LoginAttemptService`)

Kaba kuvvet parola denemeleri (brute-force) ve kimlik bilgisi doldurma (credential stuffing) saldırılarına karşı [`LoginAttemptService.java`](../src/main/java/com/serhat/secondhand/auth/application/LoginAttemptService.java) iki aşamalı bir kilit uygular:

### 4.1 İki Aşamalı Kilit Mantığı

```
Giriş Denemesi Başarısız Oldu
         │
         ├──> 1. Hesap + IP Sayacı Artır (auth:login-fail:account:<email>:<ip>)
         └──> 2. Global IP Sayacı Artır (auth:login-fail:ip:<ip>)
```

1. **Tier 1: Hesap + IP Bazlı Kilit:**
   - **Anahtar:** `auth:login-fail:account:<email>:<clientIp>`
   - **Eşik:** 15 dakika içinde **5 başarısız deneme**.
   - **Hizmet Reddi (DoS) Koruması:** Sayaç hesap ile IP'nin kombinasyonuna bağlıdır. Bir saldırgan başka bir kullanıcının e-postasını rastgele şifrelerle bombalasa dahi yalnızca *saldırganın kendi IP'si* kilitlenir; hesabın gerçek sahibi kendi IP'sinden giriş yapmaya devam edebilir.
2. **Tier 2: Global IP Bazlı Kilit:**
   - **Anahtar:** `auth:login-fail:ip:<clientIp>`
   - **Eşik:** 15 dakika içinde **20 başarısız deneme**.
   - **Credential Spraying Koruması:** Tek bir IP'den 20 farklı kullanıcı hesabına birer kez şifre denense dahi, global IP limiti tetiklenir ve o IP tüm hesaplar için 15 dakika engellenir.

### 4.2 TTL Güvencesi ve Başarılı Giriş Davranışı
- **Atomik Sayaç Başlatma:** Redis'te süresiz anahtar birikmesini önlemek için önce `opsForValue().setIfAbsent(key, "0", Duration.ofMinutes(15))` çağrılır, ardından `increment(key)` yapılır.
- **Başarılı Girişte Kısmi Temizlik:** Kullanıcı doğru şifreyle giriş yaptığında (`loginSucceeded`), yalnızca `accountKey` silinir. Saldırganın geçerli bir test hesabı açarak IP sayacını sıfırlamasını engellemek için **`ipKey` ASLA silinmez**.
- **Normalizasyon:** E-posta adresleri büyük/küçük harf ve boşluk farklarından etkilenmeyecek şekilde normalize edilir (`email.trim().toLowerCase(Locale.ROOT)`).

---

## 5. Katman 3: Domain ve İş Akışı Seviyesindeki Hız Sınırları

### 5.1 Safe Meetup OTP Kod Yenileme Sınırı (`OrderCompletionService`)
Alıcı ve satıcının yüz yüze teslimatında kullanılan 6 haneli teslimat kodunun sürekli yeniden üretilmesini engellemek için:
- **Kod Yenileme Cooldown Sınırı:** [`OrderCompletionService.java`](../src/main/java/com/serhat/secondhand/order/application/OrderCompletionService.java#L185-L190) üzerinde kod yenileme istekleri arasında en az **30 saniye** beklenmesi zorunludur:
  ```java
  if (order.getMeetupVerificationCodeGeneratedAt().isAfter(LocalDateTime.now().minusSeconds(30))) {
      return Result.error("Please wait at least 30 seconds between code regenerations", "RATE_LIMIT_EXCEEDED");
  }
  ```
- **Kod Yaşam Süresi:** Üretilen kod 5 dakika sonra geçersiz hale gelir (`MEETUP_CODE_EXPIRED`).

### 5.2 Safe Meetup OTP Brute-Force Kilitlenmesi (`VERIFICATION_LOCKED`)
Satıcının alıcı kodunu tahmin etmesini engellemek için:
- **Maksimum Hatalı Deneme:** 3 deneme.
- **Kilitlenme:** 3. hatalı denemede sipariş durumu `OrderStatus.VERIFICATION_LOCKED` yapılır ve `verificationLockedUntil = LocalDateTime.now().plusMinutes(15)` atanır.
- 15 dakika boyunca teslimat doğrulama yapılamaz (`HTTP 403 Forbidden`). 15 dakika dolduğunda sayaç otomatik sıfırlanarak sipariş tekrar `MEETUP_PENDING` durumuna geçer.

### 5.3 Aura AI Canlı İlan Arama Hız Sınırı (`AuraAgentSearchRateLimiter`)
Aura sohbeti sırasında kullanıcının canlı ilan arama motorunu aşırı yüklemesini önlemek için:
- **Yapı:** [`AuraAgentSearchRateLimiter.java`](../src/main/java/com/serhat/secondhand/ai/agent/search/AuraAgentSearchRateLimiter.java) içinde bellek içi (in-memory) kayan pencere logu (`ConcurrentHashMap<Long, Deque<Long>>`).
- **Sınır:** Kullanıcı başına dakikada maksimum **12 canlı arama** (`aura.agent.search.rate-limit-per-minute: 12`, pencere: 60.000 ms).
- **Limit Aşımı:** İstek reddedilmez; arama adımı atlanarak (`AgentSearchAugmentation.rateLimited()`) sohbet akışı kesintisiz sürdürülür.

### 5.4 Kullanıcı Günlük Aura AI Kotası (`UserRepository.reserveAuraSlot`)
Kullanıcıların üyelik planlarına göre günlük AI soru sorma limitleri veritabanı seviyesinde atomik koşullu güncelleme ile kontrol edilir ([`UserRepository.java`](../src/main/java/com/serhat/secondhand/user/domain/repository/UserRepository.java#L52-L68)):

```sql
UPDATE users
   SET daily_aura_usage = CASE WHEN daily_aura_reset_date = :today THEN daily_aura_usage + 1 ELSE 1 END,
       daily_aura_reset_date = :today
 WHERE id = :userId
   AND (daily_aura_reset_date IS DISTINCT FROM :today OR daily_aura_usage < :dailyLimit);
```

- Etkilenen satır sayısı `0` dönerse kullanıcının günlük kotası dolmuştur ve `AURA_LIMIT_EXCEEDED` hatası fırlatılır; harici LLM API'sine boşuna çağrı yapılmaz.
- Soru cevaplanamaz veya hata oluşursa `releaseAuraSlot` ile sayaç bir geri alınarak compensation sağlanır. Gece yarısı geçtiğinde sayaç otomatik olarak 1'e resetlenir.

### 5.5 Harici Gemini API 429 ve Exponential Backoff (`GeminiClient`)
Google Gemini API'sinden HTTP 429 Too Many Requests yanıtı alındığında [`GeminiClient.java`](../src/main/java/com/serhat/secondhand/ai/application/GeminiClient.java#L100-L120):
- Doğrudan hata fırlatmak yerine `backoffMillis` dizisindeki süreler kadar bekleyerek yeniden dener (`exponential backoff`).
- Deneme hakları tükendiğinde client'a `AI_RATE_LIMIT_EXCEEDED` hata koduyla HTTP 429 döner.

---

## 6. Üretim Ortamı Güvenlik Koruması (`ProdSecurityGuard`)

Uygulama `prod` profiliyle başlatıldığında [`ProdSecurityGuard.java`](../src/main/java/com/serhat/secondhand/core/config/ProdSecurityGuard.java#L49-L51) açılış anında devreye girer:

```java
if (!rateLimitConfig.isEnabled()) {
    errors.add("app.rate-limit.enabled must be true in prod profile.");
}
```

Eğer üretim ortamında `RATE_LIMIT_ENABLED=false` olarak yapılandırılmışsa, uygulama ayağa kalkmayı **reddeder** ve `IllegalStateException` ile durur.

---

## 7. Test, Doğrulama ve Gözlemlenebilirlik

### 7.1 Test Endpoint'leri (`RateLimitTestController`)
`app.test-endpoints.enabled=true` olduğunda `/api/v1/test/rate-limits/**` endpoint'leri aktifleşir ([`RateLimitTestController.java`](../src/main/java/com/serhat/secondhand/core/api/RateLimitTestController.java)):
- `GET /api/v1/test/rate-limits/auth`: Auth kategorisi limitlerini ve kalan hakları döndürür.
- `GET /api/v1/test/rate-limits/payment`: Payment kategorisi limitlerini döndürür.
- `GET /api/v1/test/rate-limits/general`: General limitlerini döndürür.
- `POST /api/v1/test/rate-limits/auth/burst`: Auth burst davranışını test eder.
- `POST /api/v1/test/rate-limits/payment/burst`: Payment burst davranışını test eder.

### 7.2 Otomatik Testler
1. [`RateLimitingFilterTest.java`](../src/test/java/com/serhat/secondhand/core/security/RateLimitingFilterTest.java):
   - Güvenilmeyen proxy'den gelen `X-Forwarded-For`'un reddedilmesi.
   - Sağdan sola doğru ilk güvenilmeyen IP'nin seçilmesi.
   - Geçersiz IP veya alan adı içeren zincirlerin elenmesi.
   - Limit aşıldığında HTTP 429 ve `Retry-After` header doğrulaması.
   - Redis kapandığında 503 Service Unavailable fail-closed doğrulaması.
2. [`LoginAttemptServiceTest.java`](../src/test/java/com/serhat/secondhand/auth/LoginAttemptServiceTest.java):
   - Saldırgan IP'sinin kilitlenip kurban IP'sinin kilitlenmediğinin doğrulanması.
   - 20 farklı hesabı deneyen IP'nin tüm hesaplar için engellenmesi.
   - Başarılı girişte hesap sayacının temizlenip IP sayacının korunduğunun doğrulanması.
3. [`AuraDailyQuotaTest.java`](../src/test/java/com/serhat/secondhand/ai/AuraDailyQuotaTest.java):
   - Gece yarısı resetlenmesi ve günlük limit aşımında Gemini çağrısı yapılmadan `AURA_LIMIT_EXCEEDED` fırlatılması.

---

## 8. İlgili Yapılandırma Özeti (Cheat Sheet)

| Environment Değişkeni | Varsayılan Değer | Açıklama |
| :--- | :--- | :--- |
| `RATE_LIMIT_ENABLED` | `true` | Rate limiting ana anahtarı (prod'da zorunlu `true`). |
| `RATE_LIMIT_AUTH` | `20` | Auth istek limiti (60 sn'lik pencere başına 20 istek). |
| `RATE_LIMIT_PAYMENT` | `10` | Ödeme istek limiti (60 sn'lik pencere başına 10 istek). |
| `RATE_LIMIT_AI` | `15` | AI endpoint'leri istek limiti (60 sn'lik pencere başına 15 istek). |
| `RATE_LIMIT_GENERAL` | `150` | Genel endpoint istek limiti (60 sn'lik pencere başına 150 istek). |
| `RATE_LIMIT_WINDOW` | `60` | Fixed-window pencere süresi (saniye). |
| `RATE_LIMIT_TRUST_FORWARDED_HEADERS`| `true` | `X-Forwarded-For` / `X-Real-IP` başlıklarını dikkate alma. |
| `RATE_LIMIT_TRUSTED_PROXIES` | `127.0.0.0/8,::1/128,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,fc00::/7` | Güvenilen proxy CIDR blokları. |
| `AURA_AGENT_SEARCH_PER_MINUTE` | `12` | Kullanıcı başına dakikalık canlı ilan arama sınırı. |
| `AURA_AGENT_SEARCH_WINDOW_MS` | `60000` | Canlı ilan arama pencere süresi (ms). |
