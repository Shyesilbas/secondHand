# Showcase Paketi

Bu paket, vitrin (showcase) satın alma, listeleme, uzatma, iptal ve süresi dolan kayıtların yönetiminden sorumludur.

## Amaç ve Sınır

- Bir listing belirli gün sayısı için vitrine alınır.
- Vitrin açma ve uzatma ödeme doğrulaması ile çalışır.
- İptal işlemi görünürlüğü kapatır; iade süreci backend ödeme akışında yönetilir.
- Paket, listing detay üretmez; listing DTO üretimi `ListingMapper` üzerinden yapılır.

## Akış Haritası (Controller -> Service -> Repository -> Mapper)

- `api/ShowcaseController`
  - `POST /api/showcases`: vitrin oluşturma.
  - `GET /api/showcases/active`: page'li aktif vitrin listesi.
  - `GET /api/showcases/my`: kullanıcının aktif vitrinleri.
  - `POST /api/showcases/{id}/extend`: süre uzatma.
  - `POST /api/showcases/{id}/cancel`: vitrin iptali.
  - `GET /api/showcases/pricing-config`: fiyat konfigürasyonu.

- `application/ShowcaseService`
  - İş kuralları, ödeme çağrısı, yetki kontrolü, durum geçişleri.
  - `extend/cancel` için sahiplik doğrulaması (`userId` eşleşmesi).
  - `active` liste için `Pageable` destekli servis metodu.

- `repository/ShowcaseRepository`
  - Aktif vitrin page sorgusu (`countQuery` ile).
  - Kullanıcının vitrinlerini listing+satici ile fetch eden sorgu.
  - Expire için aktif ve zamanı dolmuş kayıt sorgusu.

- `ShowcaseMapper`
  - Entity -> DTO dönüşümü.
  - Liste dönüşümünde toplu enrichment:
    - Favorite istatistikleri tek toplu çağrı.
    - Campaign fiyatlandırma tek toplu çağrı.

## Güvenlik ve Doğrulama

- `ShowcasePaymentRequest` alan doğrulamaları:
  - `listingId`, `paymentType`, `verificationCode`, `idempotencyKey` zorunlu.
  - `days` pozitif olmalı.
- Gün sayısı validasyonu `ShowcaseValidator` içinde ve konfigürasyona bağlı (`app.showcase.max-days`).
- `extend/cancel` yalnızca vitrin sahibi kullanıcı tarafından yapılabilir.

## Performans Notları

- `GET /active` artık page'li döner; büyük listelerde bellek ve yanıt süresi daha öngörülebilir.
- Mapper enrichment adımı tekil çağrılar yerine toplu çalışır (N+1 etkisini azaltır).
- Expire akışında tek tek `save` yerine `saveAll` kullanılır.

## Konfigürasyon

`application.yml` altında:

- `app.showcase.daily.cost`
- `app.showcase.fee.tax`
- `app.showcase.max-days`
- `app.showcase.active-list-default-size`
- `app.showcase.scheduler.expire-cron`

## Değişiklik Yaparken Nereden Başlanır

- API sözleşmesi değişecekse: `ShowcaseController` + ilgili frontend servis/hook.
- İş kuralı değişecekse: `ShowcaseService` + `ShowcaseValidator`.
- Sorgu/perf değişecekse: `ShowcaseRepository` + mapper toplu dönüşüm yolu.
- DTO alanı değişecekse:
  - backend: `dto/*`, `ShowcaseMapper`
  - frontend: `secondhand-frontend/src/showcase/*`

## Yeni Özellik Ekleme Mini Runbook

1. **Use-case'i sınıfla**
   - Oluşturma mı, yaşam döngüsü (extend/cancel/expire) mi, sadece sorgu mu?
2. **Yetkiyi ilk adımda tanımla**
   - İşlemi kim yapabilir? `userId` zorunlu mu?
3. **DTO + validation ekle**
   - Girdi kontratını netleştir, anotasyonları ekle.
4. **Service'te tek sorumlulukla uygula**
   - Validasyon, yetki, durum geçişi, ödeme sırası net olsun.
5. **Repository sorgusunu performans odaklı yaz**
   - Liste uçlarında pagination ve toplu enrichment uyumunu koru.
6. **Frontend entegrasyonunu tamamla**
   - `services/showcaseService.js` -> `hooks` -> ilgili ekran.
7. **Regresyon kontrolü**
   - Extend/cancel sahiplik, gün limiti, page yanıtı, iptal mesajı.
