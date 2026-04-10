# Payments Modülü Teknik Rehber

Bu doküman `secondhand-frontend/src/payments` içinde değişiklik yaparken doğru dosyayı ve katmanı seçmeniz için yazıldı.

## AI Çalışma Protokolü

### Hedef

- Ödeme ve ödeme yöntemi davranışında önce **service** (`paymentService`), sonra **React Query hook** veya **sayfa/modal** sırasını koru.
- Sabitler, query key’ler ve DTO şekilleri **`paymentSchema.js`** üzerinden tek kaynak olsun.
- **Idempotency-Key** üretimi: aynı kullanıcı aksiyonunun yeniden denemesinde anahtar stabil kalmalı; listing fee için `usePayListingFee` içindeki ref + `createListingFeePayment` header akışına uy.

### Görev Tipi → Dosyalar

| Görev | Ana dosyalar |
|--------|----------------|
| Genel ödeme oluşturma / listing fee ödemesi | `services/paymentService.js`, `paymentSchema.js` (`createPaymentRequest`, `createListingFeePaymentRequest`) |
| İlan ücreti akışı, OTP, sözleşme | `hooks/useListingPaymentFlow.js`, `components/PaymentVerificationModal.jsx`, `pages/PayListingFeePage.jsx` |
| Ödeme geçmişi, filtre, sayfalama | `hooks/usePayments.js`, `pages/PaymentsPage.jsx`, `hooks/queries.js` (`usePaymentsQuery`) |
| Kart / banka CRUD, ödeme yöntemleri birleşik sorgu | `hooks/useFinancialAccountManager.js`, `pages/PaymentMethodsPage.jsx` |
| İstatistik kartları (dashboard) | `hooks/queries.js` (`usePaymentStatisticsQuery`), `paymentSchema.js` (`pickPaymentStatistic`, `PAYMENT_STATISTICS_FIELD_KEYS`) |
| E-posta geçmişi (OTP e-postaları) | `hooks/useEmails.js` |
| Taslak ilan listesi (ücret öncesi) | `hooks/useListingPaymentFlow.js` (`useDraftListings`), `PAYMENT_FLOW_DEFAULTS` |

### Uygulama Sırası

1. Yeni API endpoint veya alan: `apiEndpoints` → `paymentService` → gerekirse `PaymentDto` / `BankDto` / request builder’lar.
2. Yeni React Query anahtarı: `PAYMENT_QUERY_KEYS` içine ekle; invalidation tek tip prefix kullansın.
3. Idempotency gerektiren POST: header’da `Idempotency-Key`; gövdede anahtar bırakma (service içinde strip edilir).
4. Çok kaynaklı fetch (`Promise.allSettled`): tek taraf 404 ise boş dizi; 404 olmayan hata mutlaka yükseltilmeli.
5. Lint: yalnızca dokunduğun payments dosyalarını kontrol et.

### Kabul Kriteri

- Aynı ödeme denemesi için idempotency anahtarı **rastgele her istekte değişmemeli** (listing fee: ref ile tek anahtar, başarıda sıfırlama).
- Banka silme: hangi hesap için onay verildiyse o satırla ilişkili `id` akışta taşınmalı (backend tek hesap silse bile UI tutarlılığı).
- Ödeme öncesi: seçilen yöntem için **yeterli limit/bakiye** yoksa “Start” kapalı (`PaymentVerificationModal` içi `canProceedWithPaymentMethod`).
- Ödeme listesi sorgusu: gereksiz sürekli refetch yok; makul `staleTime` + kontrollü `refetchOnMount`.

### Yasaklar

- `Date.now()` ile tek başına idempotency anahtarı üretmek (yeniden denemede yeni tahsilat riski).
- İstatistik alan adlarını sayfada dağınık string listeleriyle çoğaltmak; `pickPaymentStatistic` / `PAYMENT_STATISTICS_FIELD_KEYS` kullan.
- `refetch()` sonucunu sadece `catch` ile ele almak; `isError` / `status` kontrol et.

### Hızlı İstek Şablonları (AI)

- "Çift tahsilat / tekrar istek" → `paymentService.createPayment` / `createListingFeePayment` header + `usePayListingFee` idempotency ref.
- "Banka sildiğim hesap yanlış" → `deleteBankAccount(accountId)`, `PaymentMethodsPage` onay ve `deletingBankAccountId`.
- "Kart var ama ödeme başlamıyor" → `canProceedWithPaymentMethod` + `feeConfig.totalCreationFee` ve kart `limit`/`amount`, banka `balance`.
- "Ödeme listesi sürekli yenileniyor" → `hooks/queries.js` `usePaymentsQuery` `staleTime` / `refetchOnMount`.
- "İstatistikler 0 görünüyor" → backend alan adı değişimi; `PAYMENT_STATISTICS_FIELD_KEYS` ve `pickPaymentStatistic` güncelle.

## Mimari Özet

- **`paymentSchema.js`**: `PAYMENT_QUERY_KEYS`, `PAYMENT_TYPES`, `PAYMENT_FLOW_DEFAULTS` (taslak ilan sayfalama), `PAYMENT_STATISTICS_FIELD_KEYS`, `pickPaymentStatistic`, DTO ve request builder’lar.
- **`services/paymentService.js`**: REST çağrıları; idempotency header; listing fee gövdesinden `idempotencyKey` ayrımı.
- **`hooks/useListingPaymentFlow.js`**: Taslak ilanlar (çok sayfa birleştirme), `usePayListingFee` (OTP, sözleşme, listing fee ödemesi, idempotency ref).
- **`hooks/useFinancialAccountManager.js`**: Kart/banka mutasyonları, `usePaymentMethods` (kart + banka paralel yükleme, hata yükseltme kuralları).
- **`hooks/queries.js`**: `usePaymentsQuery`, `useBankAccountsQuery`, `usePaymentStatisticsQuery`.
- **`hooks/usePayments.js`**: Ödeme listesi state, filtreler, sayfa boyutu.
- **`hooks/useEmails.js`**: E-posta listesi; `refetch` sonrası `isError` ile bildirim.
- **`components/PaymentVerificationModal.jsx`**: Yöntem özeti, yeterlilik kontrolü, OTP akışı.
- **`pages/PaymentsPage.jsx`**: Geçmiş + istatistik özet kartları (`pickPaymentStatistic`).
- **`pages/PaymentMethodsPage.jsx`**: Kart / banka / e-cüzdan sekmeleri; banka silmede hesap kimliği.

## Çekirdek Veri Akışı

1. **Ödeme geçmişi**: `usePaymentsQuery` → `paymentService.getMyPayments` → sayfalı liste.
2. **İlan ücreti**: Taslak seçimi → `PaymentVerificationModal` → doğrulama kodu → `createListingFeePayment` (header’da idempotency).
3. **Ödeme yöntemleri**: `usePaymentMethods` veya ayrı `useCreditCard` / `useBankAccountsQuery`; mutasyon sonrası ilgili query invalidation.
4. **İstatistik**: `getStatistics` → `pickPaymentStatistic` ile alan adı sapmalarına tolerans.

## Son Refactor Notları (Kısa)

- Idempotency: genel ödeme ve listing fee için `Date.now()` tabanlı anahtar kaldırıldı; listing fee için oturum başına stabil UUID/ref.
- Banka silme: `accountId` zorunlu; onay metni hesaba özel; silme sırasında satır bazlı loading.
- `usePaymentMethods`: Kısmi başarısızlıkta (404 dışı) hata yükseltme.
- Taslak ilanlar: sayfa sayfa birleştirme, üst limit `PAYMENT_FLOW_DEFAULTS`.
- `usePaymentsQuery`: daha az agresif yenileme (`staleTime`, `refetchOnMount`).
- `PaymentsPage`: istatistik alanları `pickPaymentStatistic` ile merkezileştirildi.
- `useEmails.fetchEmails`: `refetch` `isError` ile hata bildirimi.

## Mini Runbook

**Idempotency / çift istek**  
Aynı kullanıcı tıklamasında birden fazla POST gidiyorsa: listing fee için ref temizliği (`selectedListing` değişimi, başarı sonrası) ve header anahtarını kontrol et.

**Banka silinmiyor veya yanlış hissi**  
Backend tek DELETE ise bile UI’da `account.id` ve onay metni tutarlı mı; `deleteBankAccount` çağrısına id geçiyor mu.

**Ödeme yöntemi var ama ilerlemiyor**  
`feeConfig.totalCreationFee` ile kart limit/fark ve banka bakiyesi; `canProceedWithPaymentMethod`.

**İstatistikler yanlış**  
Network yanıtındaki alan adlarını `PAYMENT_STATISTICS_FIELD_KEYS` ile hizala.

**E-postalar yüklenmiyor, sessiz kalıyor**  
`useEmails.fetchEmails` içinde `res.isError` ve mesaj gösterimi.
