# Offers (Teklif) Sistemi — Uygulama Özeti

Bu doküman, bu oturumda `secondHand` projesine eklenen **Offers (Teklif)** özelliğini ve **kabul edilen teklifin normal Checkout akışına taşınması** değişikliklerini özetler.

## İş Kuralları

- **VEHICLE** ve **REAL_ESTATE** ilanlarında teklif **verilemez**.
- Kullanıcı kendi ilanına teklif **veremez**.
- Teklifler **24 saat** geçerlidir (`expiresAt`).
- Teklifte kullanıcı **quantity seçebilir**.
- Teklifte girilen fiyat **TOTAL price**’dır (seçilen quantity için toplam tutar).
- Teklif checkout’ta **normal `/checkout`** sayfasından devam eder.
  - Sepet + teklifli ürün **birlikte** gösterilir.
  - Teklifli satırda **campaign uygulanmaz**.
  - Kupon **uygulanabilir**.

## Backend

### Yeni paket

- `src/main/java/com/serhat/secondhand/offer/`
  - `entity/Offer.java`
  - `entity/OfferStatus.java` (`PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `COMPLETED`)
  - `entity/OfferActor.java` (`BUYER`, `SELLER`)
  - `dto/CreateOfferRequest.java` (listingId, quantity, totalPrice)
  - `dto/CounterOfferRequest.java` (quantity, totalPrice)
  - `dto/OfferDto.java`
  - `repository/OfferRepository.java`
  - `service/OfferService.java`
  - `api/OfferController.java`
  - `util/OfferErrorCodes.java`

### Teklif oluşturma / listeleme / aksiyonlar

- **Create**: buyer listingId + quantity + totalPrice gönderir.
- **List**:
  - `/api/v1/offers/made` (buyer tarafı)
  - `/api/v1/offers/received` (seller tarafı)
- **Aksiyonlar**:
  - `/api/v1/offers/{id}/accept`
  - `/api/v1/offers/{id}/reject`
  - `/api/v1/offers/{id}/counter`

### Pazarlık (chain) modeli

- Counter işlemi **yeni bir `Offer` kaydı** üretir.
- Yeni kaydın `parentOffer` alanı önceki teklife bağlanır.
- Önceki teklif `REJECTED` yapılır.

### “Receiver” bazlı aksiyon kontrolü

`OfferService` içinde accept/reject/counter işlemleri, sadece teklifin **alıcı tarafı** (receiver) için izinli olacak şekilde düzenlendi:

- `createdBy=BUYER` ise receiver **SELLER** tarafıdır.
- `createdBy=SELLER` ise receiver **BUYER** tarafıdır.

Bu sayede, seller counter attıktan sonra buyer da aynı endpoint’lerden (accept/reject/counter) süreci devam ettirebilir.

### Checkout entegrasyonu (normal checkout)

#### CheckoutRequest

- `src/main/java/com/serhat/secondhand/order/dto/CheckoutRequest.java`
  - `offerId` alanı eklendi.

#### CheckoutService

- `src/main/java/com/serhat/secondhand/order/service/CheckoutService.java`
  - `offerId` varsa `OfferService.getAcceptedOfferForCheckout(...)` ile **ACCEPTED** teklif doğrulanır.
  - Sepet item’ları ile offer item birleştirilir:
    - Aynı listing sepetteyse eski satır elenir, offer satırı eklenir.
  - Ödeme başarılıysa `OfferService.markCompleted(offer)` çağrılır.

#### PricingService

- `src/main/java/com/serhat/secondhand/pricing/service/PricingService.java`
  - Overload eklendi:
    - `priceCart(buyer, cartItems, couponCode, offerListingId, offerQuantity, offerTotalPrice)`
  - Offer satırı için:
    - `unitPrice = offerTotalPrice / offerQuantity` (2 decimals, HALF_UP)
    - `lineSubtotal = offerTotalPrice`
    - `campaign` uygulanmaz (offer satırında campaign discount `0`)
  - Kupon hesapları mevcut sistem üzerinden devam eder (campaign sonrası subtotal’a uygulanır).

#### Coupon preview ve payment verification

- `src/main/java/com/serhat/secondhand/coupon/dto/CouponPreviewRequest.java`
  - `offerId` eklendi.
- `src/main/java/com/serhat/secondhand/coupon/api/CouponController.java`
  - Preview endpoint’i offerId varsa cart+offer üzerinden fiyat preview yapacak şekilde genişletildi.
- `src/main/java/com/serhat/secondhand/payment/dto/InitiateVerificationRequest.java`
  - `offerId` eklendi.
- `src/main/java/com/serhat/secondhand/payment/service/PaymentVerificationService.java`
  - Verification email pricing hesapları offerId üzerinden de çalışacak şekilde genişletildi.

#### Order item total’ı

Offer satırında unitPrice * quantity yerine toplam fiyatın kaybolmaması için:

- `src/main/java/com/serhat/secondhand/order/service/OrderCreationService.java`
  - `PricingResultDto.items[].lineSubtotal` map’lenerek `OrderItem.totalPrice` set ediliyor.

## Frontend

### API endpoints + routes

- `secondhand-frontend/src/common/constants/apiEndpoints.js`
  - `API_ENDPOINTS.OFFERS.*` eklendi.
- `secondhand-frontend/src/common/constants/routes.js`
  - `ROUTES.OFFERS = '/offers'` eklendi.
- `secondhand-frontend/src/common/routes/AppRoutes.jsx`
  - Offers route eklendi.
- `secondhand-frontend/src/user/DashboardPage.jsx`
  - Dashboard’a Offers girişi eklendi.

### Offer service

- `secondhand-frontend/src/offer/services/offerService.js`
  - create/listMade/listReceived/getById/accept/reject/counter wrapper’ları eklendi.

### Make Offer / Counter Offer modalları

- `secondhand-frontend/src/offer/components/MakeOfferModal.jsx`
  - Quantity + Total price input.
  - “You’re offering for N item(s). Total offer: …” info gösterimi.
- `secondhand-frontend/src/offer/components/CounterOfferModal.jsx`
  - Quantity + Total price input.
  - Counter info gösterimi.

### Listing entegrasyonu

- `secondhand-frontend/src/listing/components/ListingCard.jsx`
  - Make Offer ikonu (`HandCoins`) eklendi.
  - `MakeOfferModal` ile bağlandı.
  - Owner veya VEHICLE/REAL_ESTATE veya ACTIVE değilse gösterilmez.
- `secondhand-frontend/src/listing/pages/ListingDetailPage.jsx`
  - Make Offer ikonu eklendi.
  - `MakeOfferModal` ile bağlandı.

### Offers sayfası

- `secondhand-frontend/src/offer/pages/OffersPage.jsx`
  - Tabs: “Offers I Made” / “Offers I Received”
  - Offer card üzerinde quantity + total + created/expires + status gösterimi.
  - Seller tarafı: accept/reject/counter.
  - Buyer tarafı: accepted ise “Continue to Checkout” → `/checkout?offerId=...`.

### Checkout entegrasyonu

- `secondhand-frontend/src/cart/pages/CheckoutPage.jsx`
  - Query param’dan `offerId` okunur.
  - Offer + listing bilgisi yüklenir ve cart display listesine “offer item” olarak eklenir.
  - Coupon preview çağrısı `offerId` ile yapılır.
  - Sepet boş olsa bile offerId varsa checkout sayfası render edilir.
- `secondhand-frontend/src/cart/services/couponService.js`
  - `preview(couponCode, offerId)` signature’ı eklendi.
- `secondhand-frontend/src/cart/hooks/useCheckout.js`
  - Checkout payload’ına `offerId` eklendi.
  - Verification payload’ına `offerId` eklendi.
- `secondhand-frontend/src/cart/components/checkout/CheckoutOrderSummary.jsx`
  - Offer satırı için:
    - Campaign display kapalı
    - Line total = `offerTotalPrice`
    - “Offer item” etiketi
- `secondhand-frontend/src/cart/components/checkout/CheckoutReviewStep.jsx`
  - Offer satırı için:
    - Line total = `offerTotalPrice`
    - “Offer” etiketi

## Notlar / Bilinen Kısıtlar

- Listing entity’sinde stok/available quantity alanı bu doküman yazıldığı an itibariyle net olmadığı için backend’de `quantity <= available` validasyonu yapılmadı. Mevcut kural `quantity >= 1`.
- Offer checkout’ta “campaign uygulanmasın” kuralı, pricing seviyesinde offer satırına campaign’i kapatarak sağlandı.

