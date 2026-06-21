# Core Modülü

Bu modül, uygulamanın geneline hizmet eden çapraz kesen (cross-cutting) altyapı, konfigürasyon ve ortak yardımcı araçları barındırır.

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## Altyapı Bileşenleri

### 1. Güvenlik & Yetkilendirme (`core.jwt` & `core.security`)
- **JWT Altyapısı:** `JwtUtils` ve `AuthenticationFilter` üzerinden token doğrulama, token rotasyonu (RTR - Refresh Token Rotation) ve HttpOnly güvenli çerez yönetimi.
- **Dynamic Public Endpoints:** `@PublicEndpoint` anotasyonunu tarayarak dinamik bir şekilde kimlik doğrulama gerektirmeyen adresleri belirleyen `PublicEndpointRegistry` yapısı.
- **CSRF Koruması:** `CsrfCookieFilter` ile `SameSite=Strict` uyumlu çerez bazlı CSRF koruması.
- **Rate Limiting:** `RateLimitingFilter` ile API istek sayılarını (Auth ve Payment işlemleri için özel) IP ve User bazlı sınırlandırma.
- **HTTP Headers:** `SecurityHeadersFilter` ile standard HTTP güvenlik başlıklarını (HSTS, CSP, X-Frame-Options vb.) ekleme.

### 2. Hata Yönetimi (`core.exception`)
- **Global Hata Yakalayıcı:** `GlobalExceptionHandler` ile uygulamanın fırlattığı tüm `BusinessException` ve Java/Spring hata türlerini frontend'e standard `{ error: "KOD", message: "..." }` biçiminde dönüştürme.

### 3. API Response Standardı (`core.result`)
- **Result Wrapper:** Tüm servis ve API katmanlarında kullanılan generic `Result<T>` sınıfı ve bu sonucu ResponseEntity'ye çeviren `ResultResponses` sınıfı.

### 4. Doğrulama Kodları (`core.verification`)
- **OTP Kod Yönetimi:** Şifre sıfırlama, e-posta/telefon doğrulama ve ödeme güvenlik kontrolleri için kullanılan, deneme limitli ve süreli OTP (One Time Password) sistemi (`VerificationService`).

### 5. Denetim Günlükleri (`core.audit`)
- **Audit Aspect:** Spring AOP ile uygulanan, hassas işlemleri (şifre değiştirme, ödemeler vb.) arka planda asenkron event'ler yardımıyla veritabanına loglayan denetim altyapısı (`AuditAspect`).

### 6. Veritabanı Besleme (`core.seed`)
- **Seeding:** Uygulama açılışında katalog verilerini (şehirler, kargo, ilan modelleri vb.) veritabanına besleyen `CatalogSeedStartupRunner`.
