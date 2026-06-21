# auth Backend Audit
_Tarih: 2026-06-21_

## Genel Değerlendirme
Önceki raporda tespit edilen `AuthService` God Object antipattern'i başarıyla çözülmüş; sorumluluklar `LoginService`, `RegistrationService`, `OAuthService`, `PasswordService` ve `TokenService` olarak Single Responsibility prensibine uygun şekilde dağıtılmış. Katmanlı mimari genel hatlarıyla çok daha sağlıklı. Access token'ların kısa süreli tutulması ve state-less bırakılması performansa olumlu etki ediyor. Bu raporda ağırlıklı olarak güvenlik zafiyetlerine (Security Vulnerabilities) odaklanılmıştır.

## Sınıf Haritası
| Katman | Sınıflar | Adet | Yorum |
|--------|----------|------|-------|
| Controller | AuthController, PasswordController | 2 | Sadece HTTP response/cookie yönetiminden sorumlu, business logic içermiyor. |
| Service | LoginService, RegistrationService, PasswordService, TokenService, vb. | 7 | Sorumluluklar mükemmel ayrılmış. |
| Repository | TokenRepository | 1 | |
| Validator/Policy | RegistrationValidator | 1 | Request validasyonları doğru katmana çekilmiş. |
| Mapper | - | 0 | `UserMapper` dışarıdan kullanılıyor. |

## Tespit Edilen Güvenlik Zafiyetleri ve Riskler

| Sorun | Sınıf/Katman | Risk | Çözüm Önerisi |
|-------|-------------|------|---------------|
| **Refresh Token Rotation (RTR) Reuse Açığı** | `LoginService` | **Kritik** | Çalınan ve önceden kullanılmış (Revoked) bir refresh token tekrar kullanıldığında, sadece `InvalidRefreshTokenException` fırlatılıyor. Gerçek bir RTR implementasyonunda, token reuse tespit edildiğinde o `familyId`'ye ait **tüm aktif tokenlar iptal edilmelidir**. Aksi takdirde saldırgan çalınan aktif token'ı kullanmaya devam edebilir. |
| **Concurrent Login / Çoklu Cihaz Politikası** | `LoginService` / `TokenService` | Orta | Kullanıcı her giriş yaptığında `tokenService.revokeUserRefreshTokens(user)` çağrılıyor. Bu, kullanıcının aynı anda sadece tek bir cihazda oturum açabilmesine neden oluyor (yeni giriş, diğer tüm cihazlardan çıkış yaptırır). Bu kasıtlı değilse, ciddi bir UX/DoS sorunudur. Sadece eski token ailesi veya süresi dolanlar iptal edilmelidir. |
| **Brute Force / Rate Limiting Eksikliği** | `AuthController` | Orta | `/login` ve `/forgot-password` endpoint'lerinde açık bir rate-limiting (ör. hesabı 15 dk kilitleme veya IP bazlı limit) görünmüyor. `AuthenticationManager` desteklemiyorsa, özel bir mekanizma eklenmeli. |
| **Logout CSRF veya Session Kapatma Çelişkisi** | `LoginService` | Düşük | `logout` işlemi yalnızca `user`'ın tüm refresh token'larını siliyor (multi-device logout'a dönüşüyor). Kullanıcının sadece mevcut oturumdan çıkış yapması (`revokeToken(refreshToken)`) beklenirken tüm cihazlardan atılmasına sebep oluyor. `revokeAllSessions` ile `logout` metodunun işlevleri birbirine karışmış. |

## Güvenlik Analizi Detayı

### Refresh Token Ailesi (Family) Takibi
`TokenService.saveToken` içinde token ailesi (`familyId`) oluşturuluyor. Ancak `LoginService.refreshToken` içinde bir token'ın REVOKED olduğu tespit edildiğinde (`!tokenService.isTokenValid(refreshTokenValue)`), o `familyId` altındaki aktif token'lar aranıp silinmiyor. Kötü niyetli kişi eski bir token'ı denerse, asıl kurbanın oturumu sonlandırılmalı.

### Rate Limiting & Brute Force
Parola sıfırlama işlemlerinde `verificationAttemptLeft` doğru bir şekilde azaltılıyor ve enumeration engellenmiş (`emailFingerprint` kullanımı ve aynı yanıtın dönülmesi çok iyi). Ancak `/login` endpoint'inde benzer bir parola deneme limiti kontrolü (Account Lockout) görülmedi.

### Access Token Revocation
Kullanıcının access token'ı kısa süreli olduğu için iptal edilmemesi bilinen bir durum ve kabul edilebilir bir trade-off'tur. Çıkış yapıldığında client tarafındaki cookie siliniyor.

### Cookie Güvenliği
`CookieUtils` içinde `HttpOnly`, `Secure` ve `SameSite` flag'leri kullanılarak XSS ve CSRF ataklarına karşı önlem alınmış. Çerez domain'i üretim ortamına göre dinamik atanıyor, bu iyi bir pratik.

## Öncelik Sırası
1. **Kritik:** `LoginService.refreshToken` içinde token reuse tespiti yapıldığında tüm token ailesinin (`familyId`) iptal edilmesi.
2. **Kritik:** `LoginService.login` içinde tüm aktif oturumların sonlandırılması davranışının (eğer bilerek yapılmadıysa) düzeltilmesi. Sadece mevcut cihazın token'ları yenilenmeli.
3. **Orta:** `LoginService.logout` işleminin sadece gönderilen refresh token'ı iptal edecek şekilde güncellenmesi.
4. **Orta:** Login endpoint'i için Rate Limiting / Account Lockout eklenmesi.

## Genel Skor
| Kategori | Puan (1-5) |
|----------|-----------|
| Katman Ayrımı | 5 |
| Transaction Yönetimi | 4 |
| Validasyon | 4 |
| Güvenlik / Token Yönetimi | 3 |
| Kod Tekrarı | 4 |
| **Ortalama** | 4.0 |
