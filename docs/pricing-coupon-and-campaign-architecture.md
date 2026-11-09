# Pricing, Coupon ve Campaign Mimarisi

Bu doküman sepet ve checkout fiyatının nasıl hesaplandığını anlatır: satıcı kampanyaları (`campaign`), platform kuponları (`coupon`), kabul edilmiş teklif fiyatı (`offer`) ve bunları birleştiren fiyat motoru (`pricing`). Modül kuralları için ayrıca [pricing/README.md](../src/main/java/com/serhat/secondhand/pricing/README.md), [coupon/README.md](../src/main/java/com/serhat/secondhand/coupon/README.md) ve [campaign/README.md](../src/main/java/com/serhat/secondhand/campaign/README.md) dosyalarına bakın.

---

## 1. Akış

```
Cart / Checkout isteği
        │
        ▼
CheckoutPricingContextFactory / CouponService.previewPricing
        │   (teklif varsa: teklif ilanının sepet satırı çıkarılır, teklif miktarıyla yeniden eklenir)
        ▼
PricingService.priceCart
        │ 1. campaignService.loadActiveCampaignsForSellers(sellerIds)
        │ 2. PriceCalculationEngine.calculateCartPricing(..., coupon = null)  → kampanya sonrası ara toplam
        │ 3. CouponValidator.validateCouponForCart(coupon, buyer, cartTypes, subtotalAfterCampaigns)
        │ 4. Kupon geçerliyse calculateCartPricing(..., coupon) tekrar çalışır
        │    (checkout: priceCartForCheckout reddedilen kuponda hata kodu döner)
        ▼
PricingResultDto (satır bazlı fiyatlar, indirimler, payableBySeller)
        │
        ▼
CheckoutOrchestrator → sipariş(ler) → CouponService.redeem (checkout transaction'ı içinde)
```

* [`PriceCalculationEngine`](../src/main/java/com/serhat/secondhand/pricing/engine/PriceCalculationEngine.java) saf hesaplama yapar; repository veya dış servis çağırmaz.
* `pricing/calculator/` altındaki `CampaignDiscountCalculator` ve `CouponDiscountCalculator` hiçbir yerden çağrılmaz; aynı mantık engine içinde tekrar yazılmıştır. Değişiklik engine'de yapılmalıdır.
* Tüm tutarlar `PricingUtil.scale` ile 2 haneye `HALF_UP` yuvarlanır.

---

## 2. Hesaplama Sırası

1. **Satır fiyatı:** `listing.price × quantity`. Teklif override'ı yalnızca teklif ilanının satırına uygulanır: o satırda miktar `offer.quantity`, satır toplamı `offer.totalPrice` olur; sepetteki diğer satırlar kendi fiyat ve miktarıyla kalır (`PriceCalculationEngineTest`).
2. **Kampanya (satır bazlı):** Teklif satırına, `REAL_ESTATE` ve `VEHICLE` ilanlarına kampanya uygulanmaz. Diğer satırlarda satıcının uygulanabilir kampanyaları arasından **en yüksek birim indirimi** veren seçilir; kampanyalar birleşmez.
   * `PERCENT`: `unitPrice × value / 100`; `FIXED`: `value`. İndirim birim fiyatı geçemez.
   * `minQuantity`: Aynı kampanyaya giren sepet satırlarının toplam miktarı `minQuantity`'den azsa kampanya atlanır (bundle).
3. **Kupon (sepet bazlı):** Kampanya sonrası satır toplamları üzerinden hesaplanır (aşağıda §3). İndirim, uygun satırlara satır toplamıyla orantılı dağıtılır; yuvarlama farkı son satıra yazılır.
4. **Sonuç:** `total = subtotalAfterCampaigns − couponDiscount`; `payableBySeller` her satıcının net satır toplamlarıdır.

Listeleme ekranlarında [`ListingCampaignPricingUtil.enrichWithCampaignPricing`](../src/main/java/com/serhat/secondhand/listing/util/ListingCampaignPricingUtil.java) aynı "en iyi kampanya" kuralıyla `campaignPrice` alanını doldurur, ancak `minQuantity > 1` olan bundle kampanyaları kartlarda gösterilmez.

---

## 3. Kupon

### Entity: [`Coupon`](../src/main/java/com/serhat/secondhand/coupon/entity/Coupon.java)

| Alan | Anlamı |
| :--- | :--- |
| `discountKind` | `ORDER_PERCENT`, `ORDER_FIXED`, `TYPE_PERCENT`, `TYPE_FIXED`, `THRESHOLD_PERCENT`, `THRESHOLD_FIXED` |
| `value`, `maxDiscount` | İndirim değeri ve üst sınırı |
| `minSubtotal` | `THRESHOLD_*` için uygun ara toplam alt sınırı |
| `eligibleTypes` | `TYPE_*` kuponlarında hangi ilan tipleri indirime girer |
| `audience` | `ALL_USERS`, `USER_ID_LIST` (`coupon_eligible_users`), `NEVER_ORDERED_FIRST_ORDER` (ödemesi tamamlanmış siparişi olmayan alıcı) |
| `usageLimitGlobal`, `usageLimitPerUser` | Kullanım limitleri |
| `active`, `startsAt`, `endsAt` | Geçerlilik |

### Uygunluk ([`CouponValidator`](../src/main/java/com/serhat/secondhand/coupon/validator/CouponValidator.java))
* `validateUsable`: aktiflik (`COUPON_INACTIVE`), tarih (`COUPON_EXPIRED`), audience (`COUPON_NOT_APPLICABLE`), PostgreSQL'deki redemption sayısına göre limitler (`COUPON_USAGE_LIMIT_REACHED`).
* `validateCouponForCart`: sepette kuponun tiplerinden en az biri olmalı (tip yoksa varsayılan `REAL_ESTATE` ve `VEHICLE` dışındaki tüm tipler) ve `minSubtotal` sağlanmalı.
* **Önizleme (`priceCart`, `POST /api/v1/coupons/preview`):** Geçersiz kupon hata vermeden düşürülür, kuponsuz fiyat döner ve `couponCode` boş gelir. Frontend bunu "kupon uygulanmadı" olarak gösterir; checkout sayfası ayrıca ödemenin bu kuponla geçmeyeceğini söyler.
* **Checkout (`priceCartForCheckout`):** `CheckoutPricingContextFactory` ve OTP doğrulama mesajı (`PaymentVerificationMessageBuilder`) bu metodu kullanır. İstenen kupon bulunamazsa `COUPON_NOT_FOUND`, uygun değilse validator'ın kodu (`COUPON_EXPIRED`, `COUPON_USAGE_LIMIT_REACHED` …), indirim sıfır çıkarsa `COUPON_NOT_APPLICABLE` döner. Böylece sipariş, alıcının görmediği bir fiyattan oluşmaz.

### İndirim tutarı
* Uygun ara toplam: `REAL_ESTATE`/`VEHICLE` satırları hariç; `TYPE_*` kuponlarında yalnızca `eligibleTypes` satırları.
* `*_PERCENT`: `eligibleSubtotal × value / 100`; `*_FIXED`: `value`. Sonuç uygun ara toplamı ve `maxDiscount`'u geçemez.

### Redemption ve eşzamanlılık ([`CouponService.redeem`](../src/main/java/com/serhat/secondhand/coupon/application/CouponService.java))
1. Kupon satırı `findByCodeIgnoreCaseForUpdate` ile kilitlenir.
2. [`CouponRedisLimiterService`](../src/main/java/com/serhat/secondhand/coupon/application/CouponRedisLimiterService.java) `apply_coupon_with_limit.lua` ile `v4:coupon:usage:global:{CODE}` ve `v4:coupon:usage:user:{CODE}:{userId}` sayaçlarını tek atomik çağrıda kontrol edip artırır (TTL 30 gün). `-2` kullanıcı, `-1` genel limit aşımıdır → `COUPON_USAGE_LIMIT_REACHED`.
3. Sayaç artırıldıysa bir `TransactionSynchronization` kaydedilir: checkout transaction'ı commit edilmezse `release_coupon_usage.lua` sayaçları geri azaltır (sıfırın altına inmez).
4. `validateUsable` PostgreSQL limitlerini tekrar kontrol eder ve `coupon_redemptions` satırı yazılır. Checkout'ta kupon bir kez, indirim alan ilk siparişe bağlanarak kullanılır.
* Redis erişilemezse limiter `NOT_COUNTED` döner; karar kupon satır kilidi altındaki PostgreSQL kontrollerine kalır.

---

## 4. Kampanya

### Entity: [`Campaign`](../src/main/java/com/serhat/secondhand/campaign/entity/Campaign.java)
Satıcıya aittir: `discountKind` (`PERCENT`, `FIXED`), `value`, `startsAt`/`endsAt`, `eligibleTypes`, `eligibleListingIds`, `minQuantity` (varsayılan 1), `applyToFutureListings`, soft delete (`deletedAt`).

### Kapsam ([`ListingCampaignPricingUtil.isApplicable`](../src/main/java/com/serhat/secondhand/listing/util/ListingCampaignPricingUtil.java))
* Kampanya aktif ve tarih aralığında olmalı; `REAL_ESTATE`/`VEHICLE` hiçbir zaman uygun değildir.
* İlan listesi verilmişse yalnızca o ilanlar; tip listesi verilmişse o tiplerdeki tüm ilanlar (sonradan oluşturulanlar dahil); ikisi de boşsa satıcının tüm kampanyaya uygun ilanları.
* `applyToFutureListings` seçili ilanlı bir kampanyanın kapsamını genişletmez.

### Doğrulama ve yaşam döngüsü
* [`CampaignValidator`](../src/main/java/com/serhat/secondhand/campaign/validator/CampaignValidator.java): `CAMPAIGN_INVALID` (değer > 0, `PERCENT` ≤ 100, `startsAt` `endsAt`'tan sonra olamaz), `CAMPAIGN_EXPIRED` (`endsAt` geçmişte), `CAMPAIGN_NOT_ALLOWED_FOR_TYPE` (`REAL_ESTATE`/`VEHICLE`), `CAMPAIGN_NOT_OWNED` (seçilen ilan satıcıya ait değil).
* [`CampaignScheduler`](../src/main/java/com/serhat/secondhand/campaign/application/CampaignScheduler.java) süresi geçen kampanyaları toplu `UPDATE` ile pasifleştirir (`app.campaign.scheduler-deactivate-fixed-delay-ms`, varsayılan 10 dk). Arada fiyat hesaplaması `endsAt`'ı zaten kontrol ettiği için süresi geçmiş kampanya uygulanmaz.
* `loadActiveCampaignsForSellers`, `eligibleTypes` ve `eligibleListingIds` koleksiyonlarını ayrı sorgularla doldurur (`hydrateEligibleCollections`); kartesyen çarpım oluşmaz.

---

## 5. API

| Endpoint | Yetki | Açıklama |
| :--- | :--- | :--- |
| `GET /api/v1/campaigns/active?sellerIds=` | Giriş yapmış kullanıcı (`@PublicEndpoint` yok) | Verilen satıcıların aktif kampanyaları |
| `GET/POST /api/v1/seller/campaigns`, `PUT/DELETE /api/v1/seller/campaigns/{id}` | Giriş yapmış kullanıcı; ilan sahipliği `CampaignValidator`'da | Kampanya CRUD |
| `POST /api/v1/coupons/preview` | Kullanıcı | Sepet (ve isteğe bağlı teklif) için kuponlu fiyat önizlemesi |
| `GET /api/v1/coupons/active`, `GET /api/v1/coupons/redemptions` | Kullanıcı | Kullanılabilir kuponlar, kullanım geçmişi |
| `GET/POST /api/v1/admin/coupons`, `PUT /api/v1/admin/coupons/{id}`, `GET /api/v1/admin/coupons/audience-stats` | `ADMIN` | Kupon yönetimi |
