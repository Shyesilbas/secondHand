# Email (E-posta) Modülü

Bu modül, sistem tarafından kullanıcılara gönderilen tüm e-posta bildirimlerinin oluşturulması, gönderilmesi, veritabanına kaydedilmesi ve kullanıcıların bu e-postaları arayüz üzerinden okundu/silindi olarak yönetmesini sağlar.

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## Temel Bileşenler

### 1. E-posta Servisi (`EmailService`)
- **Şablon Motoru (Thymeleaf):** `TemplateEngine` kullanarak `resources/templates/email/` altındaki dinamik HTML şablonlarını işler.
- **Kayıt ve Takip:** Gönderilen her e-posta, alıcı bilgisi, konu, içerik türü (`EmailType`) ve gönderim zamanıyla veritabanına (`Email` tablosuna) kaydedilir.
- **Durum Yönetimi:** E-postaların okundu (`readAt`) veya silindi (`deletedAt` - soft delete) durumlarını takip eder.

### 2. Yapılandırma (`EmailConfig`)
- `app.email` prefix'i altındaki özellikleri okur.
- Şifre sıfırlama, e-posta doğrulama, yeni teklif, sipariş durumu değişikliği gibi farklı senaryolar için kullanılacak varsayılan konu başlıklarını (`subject`) yapılandırır.

### 3. REST API (`EmailController`)
- Kullanıcıların kendilerine gönderilen e-postaları sayfalamalı listelemesine, okundu olarak işaretlemesine veya silmesine imkan verir.

## E-posta Türleri (`EmailType`)
- **Şifre / Güvenlik:** Şifre sıfırlama kodu, yeni telefon numarası doğrulaması.
- **Sipariş / Satış:** Sipariş oluşturuldu, sipariş tamamlandı, sipariş iptali veya iadesi.
- **Teklifler:** Yeni teklif alındı, karşı teklif alındı, teklif kabulü veya reddi.
- **Sosyal / İlan:** Takip edilen satıcının yeni ilan yayınlaması, ilan fiyat düşüşü bildirimi.
