# Order Modülü Teknik Rehber

Bu doküman `secondhand-frontend/src/order` içinde değişiklik yaparken doğru dosyayı ve katmanı seçmeniz için yazıldı.

## AI Çalışma Protokolü

### Hedef

- Davranış değişikliğinde önce hook (`useOrderFlow`) mu, modal aksiyonları mı, yoksa saf API mi netleştir.
- Metin ve limitler `constants/orderUiConstants.js` (`ORDER_MESSAGES`, `ORDER_LIMITS`, `ORDER_DEFAULTS`) üzerinden gitsin.
- Status renk/badge metni tek kaynak: `utils/statusPresentation.js`; geriye uyumluluk için `getStatusColor` re-export `orderConstants.js` içinde.

### Görev Tipi → Dosyalar

| Görev | Ana dosyalar |
|--------|----------------|
| Liste, sayfalama, arama, modal açma | `hooks/useOrderFlow.js` |
| Modal içi iptal/iade/adres/not/isim | `hooks/useOrderDetailActions.js`, `components/OrderDetailsModal.jsx` |
| Alıcı/satıcı liste UI gövdesi | `components/shared/OrdersListLayout.jsx` |
| API çağrıları | `services/orderService.js` |
| React Query key’leri | `orderConstants.js` → `ORDER_QUERY_KEYS` |
| Sabitler (status, mesaj, süre) | `constants/orderUiConstants.js` |
| Status görünümü (badge / text / dot) | `utils/statusPresentation.js` |
| Ödeme sonrası özet sayfa | `pages/OrderSuccessPage.jsx` |

### Uygulama Sırası

1. Yeni bir API alanı veya aksiyon: önce `orderService`, sonra hook veya modal.
2. Yarış riski (hızlı modal tıklama, arama): `useOrderFlow` içinde request-id / `detailRequestRef` kalıbına uy.
3. Kullanıcıya gösterilen hata/başarı metni: `ORDER_MESSAGES`’e ekle veya mevcut anahtarı kullan.
4. Lint: yalnızca dokunduğun order dosyalarını kontrol et.

### Kabul Kriteri

- Liste yenileme: `invalidateQueries` ile çift `refetch` yapılmamalı (tek kaynak yeterli).
- Arama hata/boş sonuçta eski `searchResult` / `isSearchMode` kalıntısı bırakılmamalı.
- Modal detay ve review yükleme, daha yeni bir istek geldiyse eski yanıtı state’e yazmamalı.

### Yasaklar

- Status renklerini bileşen içinde tekrar haritalama; `statusPresentation` kullan.
- `maxLength` ve doğrulama mesajlarını sayısal limitten kopuk hardcode etme.

### Hızlı İstek Şablonları (AI)

- "Arama sonrası eski sipariş görünüyor" → `useOrderFlow` arama dalında hata/boş durumda state temizliği.
- "Refresh iki kez istek atıyor" → `useOrdersListQuery.refresh` sadece `invalidateQueries`.
- "Yeni sipariş durumu rengi" → `statusPresentation` + gerekirse `ORDER_STATUSES` / enum etiketi.
- "Başarı sayfasında detay eksik" → `OrderSuccessPage` detay fetch guard + `detailFetchDoneRef` / `orderId` değişimi.

## Mimari Özet

- **`useOrderFlow.js`**: Alıcı/satıcı modu, liste sorgusu (`ORDER_QUERY_KEYS`), URL/manuel sipariş araması, modal + receipt + review state, escrow yardımcıları.
- **`useOrderDetailActions.js`**: Modal içi mutasyonlar (isim, adres, not, iptal, iade, tamamla); bildirim ve `onReviewSuccess` ile liste senkronu.
- **`orderConstants.js`**: `ORDER_QUERY_KEYS`, `getLastUpdateInfo`, iptal/iade uygunluk yardımcıları, `getStatusColor` re-export.
- **`orderUiConstants.js`**: `ORDER_VIEW_MODES`, `ORDER_STATUSES`, sekmeler, `ORDER_DEFAULTS` / `ORDER_LIMITS` / `ORDER_MESSAGES` / `ORDER_TIME`.
- **`OrdersListLayout.jsx`**: Ortak liste sayfası iskeleti (arama, sekmeler, kartlar, pagination, modal/receipt slotları).
- **`OrderDetailsModal.jsx`**: Detay UI; review ve düzenlenebilir bölümler.
- **`OrderSuccessPage.jsx`**: Ödeme sonrası yönlendirme state’i + gerekirse tam sipariş çekimi.

## Çekirdek Veri Akışı

1. `MyOrdersPage` / `ISoldPage` `useOrderFlow({ viewMode })` kullanır.
2. Liste: `useQuery` + `orderService.myOrders` veya `sellerOrders`; `refresh` query invalidation ile yeniler.
3. Arama: `orderService.getByOrderNumber`; başarıda tek sonuç modu, hata/boşta arama state temizlenir.
4. Modal: `openOrderModal` güncel siparişi çeker; `orderDetailRequestRef` ile eski yanıtlar ezilmez; alıcıda review verisi `fetchReviewsData` ile aynı request id ile bağlanır.

## Sabitler (kısa)

- **`ORDER_QUERY_KEYS`**: Invalidation kapsamı; seller vs buyer ayrımına dikkat.
- **`ORDER_TIME`**: Escrow ve pending completion polling süreleri.
- **`ORDER_LIMITS`**: İsim/not uzunluk üst sınırları (UI `maxLength` ile aynı tutulmalı).

## Mini Runbook

**Liste güncellenmiyor**  
`refresh` / `refreshAll` ve `ORDER_QUERY_KEYS` eşleşmesini kontrol et; modal sonrası `handleReviewSuccess` zincirini incele.

**Arama tutarsız**  
Manuel submit ve `?q=` URL etkisinde `setSearchResult` / `setIsSearchMode` / `setSearchError` akışını kontrol et.

**Modal yanlış sipariş gösteriyor**  
`orderDetailRequestRef` ve `fetchReviewsData(..., detailRequestId)` eşleşmesini doğrula.

**Status renkleri dağınık**  
`getOrderStatusBadgeClass` / `getOrderStatusTextClass` / `getOrderStatusIndicatorClass` tek dosyada; yeni durum eklendiğinde üçünü de güncelle.
