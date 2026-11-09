# Social Proof ve Aciliyet Metrikleri

Bu doküman ilan kartında ve ilan detayında gösterilen "X kişinin sepetinde", "Son 24 saatte X kişi inceledi", favori sayısı ve checkout geri sayımının nereden geldiğini anlatır. Kod blokları projeden alınmıştır.

İlgili dokümanlar: stok rezervasyonu [stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md), cache TTL'leri [multi-tier-redis-caching-and-invalidation.md](multi-tier-redis-caching-and-invalidation.md).

---

## 1. Özet

| Metrik | Kaynak | Pencere / TTL | Nerede gösterilir |
| :--- | :--- | :--- | :--- |
| Son 24 saatte inceleyen | Redis ZSET `v4:listing:active_viewers:{listingId}` | 24 saatlik kayan pencere; key TTL 26 saat | İlan detayı, ilan kartı (hover) |
| Sepetinde olan | Redis SET `v4:cart:in_cart_users:{listingId}` | Kullanıcı sepetten çıkarana ya da sepet rezervasyonu dolana kadar; key TTL 7 gün | İlan detayı, ilan kartı (hover) |
| Favori sayısı | PostgreSQL `favorites` | Toplu sorgu sonucu `user:stats:favorites` cache'inde 12 saat | İlan detayı, ilan kartı |
| Checkout geri sayımı | Redis `v4:inventory:reservation:{userId}:{listingId}` | 15 dk | `CheckoutPage` |

Üç sayı tek endpoint'ten döner: `GET /api/v1/listings/{id}/social-proof`.

```json
{ "viewsLast24Hours": 12, "inCartCount": 3, "favoriteCount": 18 }
```

---

## 2. İnceleyen sayısı (Redis ZSET)

Frontend ilan açıldığında `POST /api/v1/listings/{id}/view` çağırır (public, giriş zorunlu değil). [`ListingViewService.trackView`](../src/main/java/com/serhat/secondhand/listing/application/common/ListingViewService.java) `@Async("viewTrackingExecutor")` ile çalışır, yani istek beklemez.

**1. Kim olduğu belirlenir.** Giriş yapmış kullanıcı id'siyle, anonim ziyaretçi session id'siyle, o da yoksa IP hash'iyle sayılır. İlan sahibinin kendi görüntülemesi sayılmaz.

```java
String dedupIdentifier = (userId != null) ? "u:" + userId
        : ((sessionId != null && !sessionId.isBlank()) ? "s:" + sessionId : "ip:" + ipHash);
```

**2. ZSET'e yazılır.** Member kullanıcı kimliği, score o anın milisaniyesidir. ZSET member'ları tekil olduğu için aynı kişi gün içinde 50 kez girse de **1 kişi** sayılır; yalnızca score'u güncellenir.

```java
String presenceKey = "v4:listing:active_viewers:" + listingId;
redisTemplate.opsForZSet().add(presenceKey, dedupIdentifier, (double) System.currentTimeMillis());
redisTemplate.expire(presenceKey, Duration.ofHours(26));
```

**3. Kalıcı görüntüleme kaydı ayrıca tekilleştirilir.** `listing_views` tablosuna satır yazılmadan önce `v4:listing:view:dedup:{kimlik}:{listingId}` key'i `SET NX` ile alınır (TTL `VIEW_DUPLICATE_WINDOW_HOURS` = 1 saat). Aynı kişi 1 saat içinde tekrar gelirse DB'ye yeni satır yazılmaz. Redis hata verirse satır yine yazılır. Bu tablo satıcının görüntüleme istatistikleri içindir (`GET /api/v1/listings/{id}/view-stats`), social proof sayısını etkilemez.

**4. Okuma.** 24 saatten eski kayıtlar silinir, kalan member sayısı döner:

```java
long twentyFourHoursAgo = System.currentTimeMillis() - (24L * 60L * 60L * 1000L);
redisTemplate.opsForZSet().removeRangeByScore(presenceKey, 0, (double) twentyFourHoursAgo);
Long count = redisTemplate.opsForZSet().zCard(presenceKey);
```

Redis'e ulaşılamazsa sayı `0` döner; istek hata vermez.

---

## 3. Sepetinde olan sayısı (Redis SET)

[`CartSocialMetricService`](../src/main/java/com/serhat/secondhand/cart/application/CartSocialMetricService.java) ilanı sepetinde tutan **farklı kullanıcıları** bir SET'te tutar; adet değil kişi sayılır.

```java
private static final String KEY_PREFIX = "v4:cart:in_cart_users:";
private static final Duration KEY_TTL = Duration.ofDays(7);

redisTemplate.opsForSet().add(key, userId.toString());   // sepete ekleme
redisTemplate.expire(key, KEY_TTL);
redisTemplate.opsForSet().remove(key, userId.toString()); // sepetten çıkarma
Long count = redisTemplate.opsForSet().size(key);         // SCARD
```

SET'ten çıkarma üç yerden tetiklenir:

- Kullanıcı ürünü sepetten çıkarır ya da sepeti boşaltır (`CartService`).
- Sepet rezervasyonunun süresi dolar: [`CartReservationScheduler`](../src/main/java/com/serhat/secondhand/cart/application/CartReservationScheduler.java) her 60 sn'de (`app.cart.scheduler.cleanup-fixed-rate-ms`) `reservationEndTime`'ı geçmiş sepet satırlarının rezervasyonunu temizler ve kullanıcıyı SET'ten çıkarır. Rezervasyon süresi `app.cart.reservation.timeout-minutes` = 15 dk'dır.
- Hiçbiri olmazsa key 7 gün sonra silinir.

Liste ekranlarında sayılar tek tek değil, Redis pipeline ile toplu okunur (`getInCartCounts`). `GET /api/v1/cart/reservations/count/{listing-id}` (public) aynı sayıyı tek başına döner.

> Bu sayı **sepet** içindir; checkout'ta alınan 15 dakikalık stok rezervasyonundan (`v4:inventory:reservation:*`) bağımsızdır.

---

## 4. Favori sayısı

- Tek ilan (`/social-proof`): `FavoriteStatsService.getFavoriteStats(listingId, null)` ile okunur.
- Liste (arama, vitrin): [`ListingSocialProofService.enrichWithSocialProof`](../src/main/java/com/serhat/secondhand/listing/application/common/ListingSocialProofService.java) tüm ilanlar için tek `favoriteRepository.countByListingIds` sorgusu atar ve sonucu `ListingDto.socialProof` alanına yazar.
- `FavoriteStatsService.getFavoriteStatsForListings` sonucu `user:stats:favorites` cache'inde 12 saat tutulur; favori ekleme/çıkarma (`FavoriteService`) bu cache'in tamamını temizler.

---

## 5. Checkout geri sayımı

`CheckoutPage` açıldığında `POST /api/checkout/initiate` çağrılır; sepetteki ürünler Redis'te 15 dakikalığına rezerve edilir ve kalan süre döner:

```json
{ "reserved": { "<listingId>": 1 }, "remainingTtlSeconds": 540 }
```

- Sayfa yenilenirse script aynı adet için rezervasyonu **yeniden başlatmaz**; `remainingTtlSeconds` kaldığı yerden gelir (ayrıntı: [stok dokümanı §3.1](stock-reservation-and-reconciliation.md#31-rezervasyon-reserve_stock_with_ttllua)).
- Frontend bitiş zamanını `sessionStorage`'da `checkout_reservation_expiry` olarak saklar; backend cevabı gelene kadar sayaç bu değerden devam eder.
- Rezervasyon alınamazsa (stok bitti vb.) sayfa hata mesajını gösterir ve ödemeye izin vermez.
- `DELETE /api/checkout/reservation/{listingId}` rezervasyonu elle bırakır.

---

## 6. Frontend: istek sayısını sınırlama

Bir liste sayfasında onlarca kart olduğu için her kartın kendi başına periyodik istek atması engellenmiştir. Tüm ekranlar [`useActiveReservationCount`](../secondhand-frontend/src/cart/hooks/useActiveReservationCount.js) hook'unu kullanır:

```js
useQuery({
  queryKey: ['listing', 'social-proof', listingId],
  enabled: Boolean(listingId) && enabled,
  refetchInterval: enablePolling ? pollInterval : false,
  staleTime: 30 * 1000,
  refetchOnWindowFocus: true,
});
```

| Ekran | Ayar | Sonuç |
| :--- | :--- | :--- |
| `ListingCard` | `enabled: isCardHovered` | İstek yalnızca kartın üzerine gelindiğinde atılır; polling yoktur. |
| `ListingDetailPage` | `enablePolling: true`, `pollInterval: 10 dk` | Sayfa açıkken 10 dakikada bir yenilenir. |

- Aynı ilan için sonuç 30 sn taze sayılır; bu sürede tekrar istek atılmaz.
- İstek hata verirse hook sıfır değerleri döner, UI bozulmaz.
- İlan detayında satırlar şu sırayla gösterilir: önce "`{{count}} kişinin sepetinde`", sonra "`Son 24 saatte {{count}} kişi inceledi`". İlan sahibine gösterilmez.

---

## 7. Endpoint'ler

| Method | Endpoint | Erişim | Açıklama |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/listings/{id}/view` | Public | Görüntülemeyi asenkron kaydeder (ZSET + `listing_views`). |
| `GET` | `/api/v1/listings/{id}/social-proof` | Public | `viewsLast24Hours`, `inCartCount`, `favoriteCount`. Frontend'in kullandığı endpoint. |
| `GET` | `/api/v1/listings/{id}/active-viewers` | Public | Yalnızca `{ count }` (son 24 saat). |
| `GET` | `/api/v1/cart/reservations/count/{listing-id}` | Public | Yalnızca `{ count }` (sepetinde olan kişi). |
| `GET` | `/api/v1/listings/{id}/view-stats` | İlan sahibi | Tarih aralığına göre görüntüleme istatistikleri (varsayılan son 7 gün). |
| `POST` | `/api/checkout/initiate` | Giriş yapmış | Stok rezervasyonu + `remainingTtlSeconds`. |
| `DELETE` | `/api/checkout/reservation/{listingId}` | Giriş yapmış | Rezervasyonu bırakır. |

## 8. Bilinen sınırlar

- İnceleyen sayısı yalnızca Redis'tedir; Redis verisi silinirse sayaç sıfırdan başlar.
- Liste zenginleştirmesinde (`enrichWithSocialProof`) inceleyen sayısı ilan başına ayrı Redis çağrısıyla okunur; sepet ve favori sayıları topludur.
- IP ile sayılan anonim ziyaretçiler aynı ağ arkasında tek kişi görünür.
