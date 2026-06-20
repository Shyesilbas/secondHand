# auth Backend Audit
_Tarih: 2026-06-20_

## Genel Değerlendirme
`auth` paketi genel hatlarıyla çalışır durumda ancak `AuthService` sınıfı bir God Object'e (Her Şeyi Bilen Nesne) dönüşmüş durumda. Bu sınıf 11 farklı servisi (`IUserService`, `AuthenticationManager`, `TokenService`, `UserAgreementService` vb.) enjekte ediyor ve Kayıt, Giriş, OAuth tamamlama, Token Rotasyonu ve Çıkış gibi birbirinden ayrılması gereken çok farklı flow'ları tek başına yönetiyor. Validasyon katmanının eksikliği nedeniyle iş kuralları (sözleşme kontrolü vb.) servis içine sızmış.

## Sınıf Haritası
| Katman | Sınıflar | Adet | Yorum |
|--------|----------|------|-------|
| Controller | AuthController, PasswordController | 2 | İnce yapıda, HTTP ve Cookie yönetimini düzgün yapıyor. |
| Service | AuthService, PasswordService, TokenService, vb. | 6 | `AuthService` aşırı yüklenmiş (God Object). |
| Repository | TokenRepository | 1 | |
| Validator/Policy | - | 0 | Eksik. Validasyonlar servis içine yazılmış. |
| Mapper | - | 0 | `userMapper` dışarıdan (user paketinden) kullanılıyor. |
| Event/Listener | - | 0 | `UserRegisteredEvent` fırlatılıyor ancak listener yok (diğer modüllerde). |

## Tespit Edilen Sorunlar
| Sorun | Sınıf/Katman | Risk | Çözüm Önerisi |
|-------|-------------|------|---------------|
| God Object Antipattern | `AuthService` (Service) | Kritik | `RegistrationService`, `LoginService` ve `OAuthService` olarak parçalanmalı. 11 bağımlılık çok fazla. |
| Katman İhlali (Eksik Validator) | `AuthService` (Service) | Orta | Sözleşme (Agreement) kabulleri veya kullanıcı kontrolleri servis metotlarının başında yapılıyor. Bunlar `RegistrationValidator` gibi Policy sınıflarına alınmalı. |
| Gereksiz Transaction | `AuthService` (Service) | Düşük | Sınıf seviyesinde `@Transactional` var. Login işlemi gibi ağır read-only süreçlerin gereksiz yere transaction altında ezilmemesi için metot bazlı transaction kullanılmalı. |

## Katman Analizi

### Controller
`AuthController` cookie ayarlarını (`cookieUtils` ile) düzgün yapıyor. İstekleri direkt servise iletiyor. İş mantığı sızması yok.

### Service
`AuthService` modülerlikten uzaklaşmış. Single Responsibility Principle (Tek Sorumluluk Prensibi) ciddi şekilde ihlal ediliyor. 
`PasswordService` ve `TokenService` ise kendi alanlarında iyi çalışıyor.

### Validasyon
Bu pakete ait bir Validator/Policy sınıfı yok. Controller `@Valid` kullanıyor ancak business rule'lar (örn: zorunlu sözleşmelerin kabul edilip edilmediği) direkt `AuthService.register` içinde `if (!request.getAgreementsAccepted())` şeklinde inline kontrol ediliyor.

### Repository
`TokenRepository` basit ve işlevsel. N+1 veya transaction riski yaratacak kompleks sorgular yok.

### Mapper
DTO-Entity dönüşümü için `UserMapper` kullanılıyor (user domain'ine ait). Bu normal karşılanabilir ancak Auth paketi kendi request DTO'larını kendisi User objesine dönüştürecek bir mapping barındırabilir.

### Event/Async
Kayıt işlemi bitince `UserRegisteredEvent` senkron olarak fırlatılıyor. Bu asenkron yapılabilirse kayıt işlemi daha da hızlanır.

## Transaction & Güvenlik Riski
`AuthService` sınıf seviyesinde `@Transactional` işaretlendiği için login işleminde bile (sadece son giriş tarihi güncelleniyor) veritabanı kilitleri veya bağlantı havuzu uzun süre tutulabilir. Yalnızca veri değişikliği yapan metotlar (Register, OAuthComplete, Logout) transactional olmalıdır.

## Cache Kullanımı
Paket dahilinde belirgin bir cache kullanımı görülmedi (Token'lar Redis yerine DB'de tutuluyor gibi duruyor, ancak `TokenCleanupScheduler` ile temizleniyor).

## README Durumu
Paket içerisinde `README.md` dosyası mevcut.

## Öncelik Sırası
1. **Kritik:** `AuthService`'in `RegistrationService`, `LoginService` ve `OAuthHandlerService` olarak parçalanması (God Object riskini azaltmak).
2. **Orta:** İş kurallarının (`Agreement` onayları vb.) bir Validator veya Policy sınıfına çıkarılması.
3. **Düşük:** Sınıf seviyesindeki `@Transactional` anatasyonunun metot seviyesine düşürülmesi.

## Genel Skor
| Kategori | Puan (1-5) |
|----------|-----------|
| Katman Ayrımı | 2 |
| Transaction Yönetimi | 3 |
| Validasyon | 2 |
| Kod Tekrarı | 3 |
| Dokümantasyon | 4 |
| **Ortalama** | 2.8 |
