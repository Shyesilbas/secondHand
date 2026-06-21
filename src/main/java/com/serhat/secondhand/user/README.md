# User (Kullanıcı) Modülü

Bu modül, kullanıcı hesap yönetimi, adres yönetimi, kullanıcı rozetleri (badges) ve "Harika Satıcı" (Great Seller) hak ediş sistemini yönetir.

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## Temel Bileşenler

### 1. Kullanıcı Profili (`user.application.UserService`)
- Kullanıcı oluşturma, arama, e-posta ve telefon numarası güncelleme işlemlerini yönetir.
- **Cache Stratejisi:** Kullanıcı profilleri performansı artırmak amacıyla `@Cacheable(value = "userProfile", key = "#id")` ile önbelleğe alınır. Profil güncellendiğinde (`update`), `@CacheEvict` ile cache temizlenir.

### 2. Adres Yönetimi (`user.application.AddressService`)
- Kullanıcıların teslimat ve fatura adreslerini yönetir.
- Bir adresin ana adres (main address) olarak seçilmesi durumunda, kullanıcının diğer tüm adreslerindeki ana adres bayrağı (`isMain`) kaldırılır.

### 3. Rozet Sistemi (`user.application.UserBadgeService` & `GreatSellerService`)
- Kullanıcılara belirli başarımlara göre rozet atar.
- **Harika Satıcı (Great Seller) Rozeti:**
  - `GreatSellerPolicy` politikasına göre kullanıcının son sipariş sayısı, ortalama değerlendirme puanı (ortalama rating >= 4.5 vb.) ve olumlu yorum sayısına göre belirlenir.
  - `GreatSellerEligibilitySyncService` asenkron bir scheduler veya event tetiklemesiyle çalışarak kullanıcıların bu politikaya uygunluğunu periyodik olarak tarar ve veritabanını günceller.

## İş Kuralları (Business Rules)
- **Email ve Telefon Eşsizliği:** Bir e-posta veya telefon numarası sistemde yalnızca bir kez kullanılabilir.
- **Ana Adres Zorunluluğu:** Kullanıcının aktif olan adreslerinden yalnızca biri ana adres olarak işaretlenebilir.
