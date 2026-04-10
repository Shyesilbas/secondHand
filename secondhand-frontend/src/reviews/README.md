# Reviews Paketi Teknik Rehber

Bu doküman `secondhand-frontend/src/reviews` modülünde geliştirme yaparken hızlı karar almanız için yazıldı. Amaç: akışı, sorumluluk sınırlarını ve değişiklik stratejisini tek yerde netleştirmek.

## AI Çalışma Protokolü

Bu bölüm AI agent için direkt uygulama talimatıdır.

### Hedef

- İstenen değişikliği en az dosya dokunuşu ile yap.
- Katman sınırını koru: UI, hook, service sorumluluklarını karıştırma.
- Yıldız görünümü veya gönderim davranışı değişiyorsa ortak bileşenleri (`StarIcon`, `InteractiveStarRating`, `useReviewSubmission`) birlikte değerlendir.

### Görev Tipi -> Dokunulacak Dosyalar

- Kullanıcı yorum listesi / sayfalama / “load more”:
  - `hooks/useReviews.js`
  - `pages/UserReviewsPage.jsx`
  - `components/ReviewsList.jsx`
- İlan detay yorumları (React Query):
  - `hooks/useListingReviews.js`
  - `components/ListingReviewsSection.jsx`
- Yorum oluşturma (sipariş sonrası form veya modal):
  - `hooks/useReviewSubmission.js`
  - `components/ReviewForm.jsx`
  - `components/ReviewModal.jsx`
  - `services/reviewService.js`
- Satıcı istatistik önbelleği:
  - `hooks/useSellerReviewStatsCache.js`
- Salt okunur yıldız çizimi (kart, özet, ilan rozeti):
  - `components/StarIcon.jsx`
  - `components/RatingStarsDisplay.jsx`
  - `components/ListingReviewStats.jsx` (yarım yıldız + gradient)
- API hata metni:
  - `utils/reviewError.js`
- Metin ve limitler:
  - `reviewConstants.js`

### Uygulama Sırası

1. İstek hangi katmanda çözülmeli belirle (UI/hook/service).
2. Yeni domain sabiti varsa önce `reviewConstants.js` (`REVIEW_LIMITS`, `REVIEW_DEFAULTS`, `REVIEW_MESSAGES`) güncelle.
3. Pagination veya cache anahtarı değişiyorsa `useReviews` içindeki `queryKey` ve servis imzasını aynı adımda doğrula.
4. Yıldız UI’si eklerken önce `RatingStarsDisplay` / `InteractiveStarRating` yeterli mi bak; yeni SVG path kopyalama.
5. İş bitince sadece etkilenen reviews dosyalarında lint kontrolü yap.

### Kabul Kriteri

- Aynı kullanıcı girdisi ile önceki davranış bozulmamalı (geriye uyumluluk).
- `MIN_RATING` altında backend’e istek gitmemeli; form ve modal aynı doğrulamayı `useReviewSubmission` ile paylaşır.
- Liste sayfalarında hata durumunda yeniden deneme `refetch` ile çalışır; “load more” yalnızca `hasNextPage` varken tetiklenir.
- Çoklu `ListingReviewStats` örneğinde gradient `id` çakışması olmamalı (`useId`).

### Yasaklar

- Yeni magic number ekleme; limitler `REVIEW_LIMITS` / sayfa boyutları `REVIEW_DEFAULTS` dışında bırakma.
- Aynı yıldız path’ini birden fazla dosyada tekrarlamak ( `StarIcon` / `STAR_SHAPE_PATH` kullan ).
- React Query v5’te `cacheTime` kullanma; `gcTime` kullan.

### Hızlı İstek Şablonları (AI için)

- “Yorum listesi eksik / sayfa geçmiyor”:
  - `useReviews` / `useInfiniteQuery` + `reviewService` sayfa parametrelerini kontrol et.
- “Modal gönderince hata”:
  - `useReviewSubmission`, `getReviewErrorMessage`, backend alan adları.
- “İlan kartında yıldız yanlış”:
  - `ListingReviewStats` ortalama + yarım yıldız; `RatingStarsDisplay` modu (`round` / `ceil`).

## Mimari Özeti

- `hooks/useReviews.js`: alınan ve yazılan yorumlar için `useInfiniteQuery`; `hasMore`, `loadMore`, `refetch`.
- `hooks/useListingReviews.js`: ilan bazlı yorum listesi; `gcTime` ile önbellek süresi.
- `hooks/useSellerReviewStatsCache.js`: satıcı istatistikleri için TTL + boyut sınırlı bellek önbelleği.
- `hooks/useReviewSubmission.js`: `createReview` + puan doğrulaması + hata metni (form/modal ortak).
- `services/reviewService.js`: REST çağrıları; React bağımlılığı yok.
- `components/StarIcon.jsx` / `RatingStarsDisplay.jsx` / `InteractiveStarRating.jsx`: tekrarsız yıldız UI.
- `pages/UserReviewsPage.jsx`: sekme ile alınan / verilen yorumlar; `ReviewsList` ile pagination.

## Çekirdek Veri Akışı

1. Profil yorum sayfası `useReviews` veya `useReviewsByUser` ile sayfaları birleştirir (`flatMap` içerik).
2. İlan sayfası `useListingReviews` ile ilan kimliğine bağlı sorgu çalıştırır.
3. Sipariş tamamlandıktan sonra `ReviewModal` veya gömülü `ReviewForm` `useReviewSubmission` ile gönderir.
4. Kart ve özet bileşenleri `RatingStarsDisplay` ile salt okunur yıldız çizer; ilan rozeti ortalamada yarım yıldız kullanır.

## Sorumluluk Kuralları

- Hook katmanı UI metni üretmez; mesajlar `REVIEW_MESSAGES` üzerinden veya sabit dize minimumda.
- Service katmanı React bağımlılığı içermez.
- Yıldız tıklanabilir seçim: `InteractiveStarRating`; sadece gösterim: `RatingStarsDisplay` veya `ListingReviewStats`.

## Son Refactor Notları (Neden Yapıldı)

- Yıldız SVG path ve tıklanabilir seçim ortak bileşenlere alındı; `ReviewModal` emoji yıldızdan çıkarıldı.
- `createReview` akışı `useReviewSubmission` ile tekilleştirildi.
- Kullanıcı yorumları ve yazılan yorumlar `useInfiniteQuery` ile sayfalandı; sabit `page=0,size=20` truncate kaldırıldı.
- `useListingReviews` içinde `gcTime` kullanımı (React Query v5).
- Satıcı istatistik önbelleğine TTL ve giriş üst sınırı eklendi.

## Yeni Özellik Eklerken İzlenecek Yol

### 1) Yeni yorum alanı veya doğrulama

- Backend sözleşmesini `reviewService` ile hizala.
- Sabitler `REVIEW_LIMITS` / mesajlar `REVIEW_MESSAGES`.
- Form ve modal aynı anda `useReviewSubmission` veya ortak yardımcıyı güncelle.

### 2) Liste sayfası veya sayfa boyutu

- `REVIEW_DEFAULTS` içindeki `RECEIVED_SIZE` / `WRITTEN_SIZE` ve ilgili `queryKey` parçalarını güncelle.
- Spring sayfa cevabı için `getNextPageParam` mantığını doğrula.

### 3) Salt okunur yıldız görünümü

- Tam yıldız: `RatingStarsDisplay` (`mode`: `round` | `ceil` | `floor`).
- Ortalama + yarım yıldız: `ListingReviewStats` veya aynı gradient kalıbını koruyarak genişlet.

## Kritik Değişiklik Yapmadan Önce Kontrol

- Değişiklik hook mu service mi UI mı? Katman sınırını ihlal etmeyin.
- Query anahtarı veya pagination sözleşmesi değişince eski önbellek anahtarları geçersiz kalır; regresyon riski.
- Yeni bileşende yıldız path kopyalamayın.

## Mini Runbook (Hızlı Operasyon)

### A) “Load more çalışmıyor / Try Again işe yaramıyor”

- `useReviews` dönüşünde `hasMore`, `loadMore`, `refetch` var mı kontrol et.
- `ReviewsList` hata satırında `onRetry` → `refetch` bağlı mı bak.

### B) “İlan yorumları stale veya yanlış cache”

- `useListingReviews` `queryKey` ve `gcTime` / `staleTime` değerlerini kontrol et.
- İlan güncellendiğinde invalidation tetikleniyor mu üst akışta doğrula.

### C) “Yıldızlar çoklu kartta bozuk”

- `ListingReviewStats` içinde `useId` ile üretilen gradient kimliğini kontrol et.
- `RatingStarsDisplay` modunun (`ceil` vs `round`) iş senaryosuna uyduğundan emin ol.
