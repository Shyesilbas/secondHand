# SecondHand — AI Agent Proje Raporu
_Oluşturulma: 2026-06-20_

## 1. Proje Özeti
SecondHand, Spring Boot 3.5 ve React 19 üzerine kurulu, üretim kalitesinde (production-grade), C2C pazar yeri platformudur. Gelişmiş escrow ödemeleri, gerçek zamanlı WebSocket mesajlaşması, AOP tabanlı loglama ve "Aura" (Gemini destekli) yapay zeka asistanı içerir. Yüksek trafikli, karmaşık state yönetimleri (sipariş, teklif, cüzdan) olan bir mimariye sahiptir.

## 2. Mimari Harita

### Backend Paketleri
| Paket | Sorumluluk | Kritik Sınıflar | Risk Seviyesi |
|-------|------------|-----------------|---------------|
| auth | Kimlik doğrulama, JWT yönetimi, OAuth2 | AuthenticationFilter, JwtService | 🔴 Yüksek |
| escrow | Güvenli ticaret işlemleri | EscrowService | 🔴 Yüksek |
| ewallet | Kullanıcı bakiye cüzdanları | EWalletService | 🔴 Yüksek |
| payment | Ödeme işlemleri | PaymentController | 🔴 Yüksek |
| order | Sipariş yaşam döngüsü | OrderController, OrderService | 🔴 Yüksek |
| ai | Gemini LLM entegrasyonu, Aura Agent | AuraListingSearchOrchestrator | 🔴 Yüksek |
| listing | İlan listeleme, kategorizasyon (araç, emlak) | ListingController | 🟡 Orta |
| chat | Gerçek zamanlı STOMP WebSocket mesajlaşma | ChatController | 🟡 Orta |
| offer | İlan teklifleri (Pazarlık) | OfferService | 🟡 Orta |
| campaign | Kampanya ve kuponlar | PricingEngine | 🟢 Düşük |
| review | Değerlendirme ve yorumlar | ReviewService | 🟢 Düşük |

### Frontend Modülleri
| Klasör | Sorumluluk | Bağlı Backend Paketi |
|--------|------------|----------------------|
| src/ai | Aura AI Agent UI | ai |
| src/auth | Login / Register / OAuth | auth |
| src/ewallet | Cüzdan işlemleri | ewallet |
| src/chat | STOMP WS chat arayüzü | chat |
| src/listing | İlan listeleme | listing |
| src/offer | Teklif ekranları | offer |
| src/payments | Ödeme ekranları | payment |
| src/order | Sipariş yönetimi | order |

## 3. Kritik Akışlar

### 3.1 Auth & Session Akışı
Kullanıcı Login olur veya Google OAuth2 ile girer → JwtService yeni bir Access & Refresh Token çifti üretir → Token'lar HttpOnly, SameSite secure cookie'lere yazılır → İstekler AuthenticationFilter üzerinden geçer, token doğrulanır ve SecurityContext oluşturulur.

### 3.2 Ödeme & Escrow Akışı
Alıcı ödeme yapar → Para Escrow havuzuna alınır (Payment) → Sipariş durumu "Ödendi/Onay Bekliyor" olur → Satıcı ürünü teslim eder → Alıcı onaylar → EscrowService parayı satıcının E-Wallet'ına aktarır (Ledger kaydı düşülür).

### 3.3 Listing Yaşam Döngüsü
İlan (Örn: Emlak) oluşturulur → Postgres'e kaydedilir → Redis listing cache invalidate olur → L1 Caffeine'e yeni durum yansır → Aura aramasında görünür hale gelir → Teklif (Offer) yapılabilir.

### 3.4 Aura AI Akışı
React Conversational UI üzerinden sorgu gelir → AuraListingSearchOrchestrator sorguyu alır → Context Adapter'lar (Sepet, aktif ilan, sipariş geçmişi) bağlamı hazırlar → Gemini API'ye zengin prompt gönderilir → Gelen cevap parse edilip Smart UI component'i render edilir.

### 3.5 WebSocket Chat Akışı
İstemci STOMP üzerinden WS bağlantısı kurar → Interceptor'lar bağlantı sırasında JWT auth kaydını doğrular → Geçerliyse pub/sub broker (Redis) üzerinden chat odasına abone olunur → ChatController ile anında mesaj teslimi yapılır.

## 4. Veri Katmanı

### Cache Mimarisi
- **L1 Caffeine:** Lokal, hızlı cache. Genelde Enumlar, sabit konfigürasyonlar ve değişmeyen listeler (kategoriler) için kullanılır. Düşük latency, kısa TTL.
- **L2 Redis:** Dağıtık cache. Aktif ilan aramaları, anasayfa feed'i ve rate-limit token bucket'ları ile WS Pub/Sub kanallarını tutar. İlan güncellendiğinde invalidate tetiklenir.

### Flyway Migration Durumu
- Toplam **23** adet migration var. Son migration `V23__update_listings_status_check.sql`. 
- Kritik tablo değişiklikleri: Deterministic UUID'ler, Safe Meetup alanları, Emlak/Araç detay kolonları (`V13`, `V14`, `V20`, `V22`).

### Yüksek Riskli Tablolar
- `payment` → Paranın giriş noktası. Her işlemde audit_logs gerektirir.
- `escrow` → Bekleyen paranın tutulduğu, lock mekanizması gereken tablo.
- `ewallet` → Kullanıcı bakiyeleri. Sadece ekleme/çıkarma (Ledger) yöntemiyle çalışmalıdır.
- `audit_logs` → AOP tarafından yazılır, değiştirilemez olmalıdır.

## 5. Cross-Cutting Concerns

### AOP
- **AuditLogAspect:** Kritik servislere atılan anotasyonları intercept eder. Yapan kullanıcıyı, parametreleri, sonuçları ve işlem süresini `audit_logs` tablosuna asenkron olarak yazar.
- **PriceHistoryAspect:** Listing update işlemlerini dinler. Fiyat alanı değişmişse, eski ve yeni fiyatı `price_history` tablosuna kayıt atarak grafikleri besler. Veritabanı commit'i başarılı olduktan sonra çalışır.

### Security Katmanları
İstekler şu filter zincirinden geçer:
`RateLimitingFilter` → `CsrfCookieFilter` (Double-submit token) → `AuthenticationFilter` (JWT çözümleme) → `SecurityHeadersFilter` (XSS, Clickjacking koruması).

### Rate Limiting
`.env` üzerinden Route bazlı limitler uygulanır. Auth, AI Agent, Payment ve genel endpoint'ler için farklı token bucket limitleri bulunur. Sınır aşımında `429 Too Many Requests` (reset süresi ile) dönülür.

## 6. Agent Çalışma Rehberi

### Değişiklik Yaparken Oku
| Etkilenen alan | Önce oku | Sonra bak |
|----------------|----------|-----------|
| Auth değişikliği | auth/README | AuthenticationFilter, JwtService |
| Listing değişikliği | listing/README | ListingService, cache config |
| Payment/Escrow | escrow/README + ewallet/README | EscrowService, her iki repository |
| AI/Aura | ai/README | AuraListingSearchOrchestrator, context adapters |
| Frontend state | src/[modül]/README | hooks/, services/ |

### Yüksek Risk Alanları
- `auth` → Tüm sistemi kitler, session token düşerse kimse işlem yapamaz.
- `payment` → Gerçek para akışı, hata durumunda ters işlem (rollback/refund) hayati önem taşır.
- `escrow` → Ticaretin güvenli limanı, state makinesi bozulursa para kaybolur.
- `ewallet` → Bakiye manipülasyonuna açık, race condition önlemi şarttır.
- `order` → Satın alma durumlarının (state) tam kontrol edilmesi gerekir.
- `listing` (cache invalidation) → Cache güncellenmezse eski veriler UI'da görünür, hata fırlatır.
- `Aura` (Gemini rate limit + context injection) → Pahalı API çağrıları içerir, orkestrasyonu bozulmamalıdır.

### Yapma Listesi
- Escrow ve EWallet işlemlerinde rollback mekanizmasız Transaction kullanma.
- RateLimitingFilter'ı by-pass eden yeni public endpoint açma.
- Entity nesnelerini API'de dönme (Daima DTO kullan).
- Cache katmanını atlayarak ana sayfada ağır Listing query'leri çalıştırma.

## 7. Modül Bazlı Hızlı Referans

| Modül | Giriş Noktası | Service | Validator | Repository | Cache? | Event/Async? |
|-------|--------------|---------|-----------|------------|--------|--------------|
| auth | AuthController | AuthService | AuthValidator | UserRepository | Redis(Session) | Hayır |
| listing | ListingController | ListingService | ListingValidator | ListingRepository | L1 & L2 | PriceAspect |
| order | OrderController | OrderService | OrderValidator | OrderRepository | - | Evet |
| payment | PaymentController | PaymentService | PaymentValidator | PaymentRepository | - | EscrowEvent |
| escrow | EscrowController | EscrowService | EscrowValidator | EscrowRepository | - | Evet |
| ewallet | EWalletController | EWalletService | - | EWalletRepository | - | Hayır |
| chat | ChatController | ChatMessageService| - | ChatRepository | Redis | WS PubSub |
| ai | AuraController | AuraListingSearch...| - | - | - | Context Inject |

## 8. Frontend Modül Referansı

| Modül | Ana Component | Hook'lar | API Servisi | Backend bağlantısı |
|-------|--------------|----------|-------------|-------------------|
| src/auth | LoginModal | useAuth | authService.js | /api/v1/auth |
| src/listing | ListingGrid | useListings | listingApi.js | /api/v1/listings |
| src/chat | ChatWindow | useWebSocket | chatApi.js | ws://.../ws |
| src/offer | OfferDialog | useOffer | offerApi.js | /api/v1/offers |
| src/ai | AuraChat | useAura | auraApi.js | /api/v1/ai |
| src/ewallet | WalletCard | useWallet | walletApi.js | /api/v1/ewallet |

## 9. Açık Riskler & Teknik Borç
- Caffeine ve Redis cache invalidation durumlarında olası asenkron senkronizasyon gecikmeleri.
- Aura Agent promptlarında context boyutunun token limitine dayanma riski.

## 10. Bu Raporu Güncelleme Kuralı
- Yeni backend paketi eklenince: Bölüm 2 ve 7 güncelle
- Yeni Flyway migration eklenince: Bölüm 4 güncelle
- Cache davranışı değişince: Bölüm 4 ve 6 güncelle
- Yeni AOP aspect eklenince: Bölüm 5 güncelle
