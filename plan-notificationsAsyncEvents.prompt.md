## Plan: Bildirimleri Async Event Mimarisine Taşıma

Mevcut yapıda birçok akış doğrudan `notificationService.createAndSend(...)` çağırıyor; bazıları zaten `@Async` olsa da iş kuralı ile bildirim üretimi sıkı bağlı kalıyor. Hedef, bildirim tetiklemeyi domain event tabanına alıp üreticileri sadeleştirmek, transaction izolasyonunu iyileştirmek ve yüksek trafikte gecikmeyi düşürmek. Bunu kademeli (backward-compatible) bir geçişle yapmak, mevcut websocket ve feed davranışını korurken riskleri azaltır.

### Steps
1. Bildirim çağrı envanterini çıkar ve önceliklendir: `createAndSend` kullanım noktaları ([`FavoriteService`](src/main/java/com/serhat/secondhand/favorite/application/FavoriteService.java), [`ReviewService`](src/main/java/com/serhat/secondhand/review/application/ReviewService.java), [`ChatNotificationService`](src/main/java/com/serhat/secondhand/chat/notification/ChatNotificationService.java), [`OrderNotificationService`](src/main/java/com/serhat/secondhand/order/application/OrderNotificationService.java)).
2. Event sözleşmesini tanımla: yeni `NotificationDispatchRequestedEvent` (payload: `NotificationRequest`, `sourceModule`, `dedupKey`) ve yayınlayıcı adaptörü; mevcut `INotificationService` ile geçiş süresince birlikte çalıştır.
3. Asenkron tüketiciyi ekle: `@EventListener` + `@Async("notificationExecutor")` (gerekirse `@TransactionalEventListener(AFTER_COMMIT)`), işleyicide [`NotificationService#createAndSend`](src/main/java/com/serhat/secondhand/notification/application/NotificationService.java) çağrısı ve merkezi hata loglama.
4. Üreticileri kademeli taşı: önce yüksek frekanslı ve transaction-içi çağrıları event publish’e çevir, mevcut kalıpları referans al ([`ListingCommandService`](src/main/java/com/serhat/secondhand/listing/application/common/ListingCommandService.java), [`NewListingNotificationListener`](src/main/java/com/serhat/secondhand/follow/application/NewListingNotificationListener.java)).
5. Güvenilirlik kurallarını netleştir ve testle: idempotency/dedup politikası (`metadata`/`dedupKey`), listener hata stratejisi, async listener birim/integrasyon testleri; bildirim feed sözleşmesini koru ([`NotificationFeedRepository`](src/main/java/com/serhat/secondhand/notification/repository/NotificationFeedRepository.java), [`NotificationController`](src/main/java/com/serhat/secondhand/notification/api/NotificationController.java)).

### Further Considerations
1. Teslimat garantisi hangi seviyede olsun? A) In-memory Spring event (hızlı) / B) DB outbox + scheduler (daha güvenli) / C) Harici queue (ölçeklenebilir).
2. Event tetik zamanı nasıl olsun? A) Immediate `@EventListener` / B) `AFTER_COMMIT` (rollback-safe) / C) Akış bazlı hibrit.
3. Geçiş stratejisi? A) Modül modül migration / B) Feature flag ile dual path / C) Big-bang (en riskli).

### Step 1 Execution (Tamamlandi)

#### Envanter ve Onceliklendirme

- [x] API referansi: `src/main/java/com/serhat/secondhand/notification/application/INotificationService.java` ve davranis: `src/main/java/com/serhat/secondhand/notification/application/NotificationService.java`

- [x] Kategori A - Transaction icinde senkron bloklayanlar (Yuksek Oncelik)
  1. `src/main/java/com/serhat/secondhand/agreements/application/AgreementUpdateNotificationService.java:58`
     - Cagri zinciri: `src/main/java/com/serhat/secondhand/auth/application/AuthService.java:154`, `src/main/java/com/serhat/secondhand/auth/application/AuthService.java:277`
     - Risk: login/kimlik akisini yavaslatma
  2. `src/main/java/com/serhat/secondhand/favorite/application/FavoriteService.java:98`
     - Risk: favori ekleme transaction suresini uzatma
  3. `src/main/java/com/serhat/secondhand/review/application/ReviewService.java:70`
     - Risk: yorum olusturma transaction suresini uzatma
  4. `src/main/java/com/serhat/secondhand/chat/notification/ChatNotificationService.java:41`
     - Cagri noktasi: `src/main/java/com/serhat/secondhand/chat/application/ChatService.java:198`
     - Risk: mesaj gonderme gecikmesi

- [x] Kategori B - Zaten `@Async` akisinda olanlar (Orta Oncelik)
  1. `src/main/java/com/serhat/secondhand/follow/application/SellerFollowService.java:193` (fan-out dongusu)
  2. `src/main/java/com/serhat/secondhand/order/application/OrderNotificationService.java:61`
  3. `src/main/java/com/serhat/secondhand/order/application/OrderNotificationService.java:113`
  4. `src/main/java/com/serhat/secondhand/order/application/OrderNotificationService.java:132`
  5. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:34`
  6. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:57`
  7. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:80`
  8. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:103`
  9. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:125`
  10. `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java:140`
  11. `src/main/java/com/serhat/secondhand/user/application/UserNotificationService.java:69`

- [x] Kategori C - Scheduler/background akislari (Orta-Dusuk Oncelik)
  1. `src/main/java/com/serhat/secondhand/order/application/OrderCompletionScheduler.java:167`
  2. `src/main/java/com/serhat/secondhand/agreements/application/AgreementUpdateWatcher.java:57` (`createBroadcast`)

#### Migration Sirasi

1. Dalga 1: Kategori A (#1-#4)
2. Dalga 2: Kategori B (#1-#11)
3. Dalga 3: Kategori C (#1-#2)

### Step 2-4 Execution (Devam Ediyor)

- [x] Event sozlesmesi eklendi: `src/main/java/com/serhat/secondhand/notification/application/event/NotificationDispatchRequestedEvent.java`
- [x] Publisher eklendi: `src/main/java/com/serhat/secondhand/notification/application/NotificationEventPublisher.java`
- [x] Async consumer eklendi: `src/main/java/com/serhat/secondhand/notification/application/NotificationDispatchRequestedEventListener.java`
- [x] Dalga 1 / #1 tasindi: `src/main/java/com/serhat/secondhand/agreements/application/AgreementUpdateNotificationService.java`
- [x] Dalga 1 / #2 tasindi: `src/main/java/com/serhat/secondhand/favorite/application/FavoriteService.java`
- [x] Dalga 1 / #3 tasindi: `src/main/java/com/serhat/secondhand/review/application/ReviewService.java`
- [x] Dalga 1 / #4 tasindi: `src/main/java/com/serhat/secondhand/chat/notification/ChatNotificationService.java`

### Dalga 2 Execution (Tamamlandi)

- [x] `src/main/java/com/serhat/secondhand/follow/application/SellerFollowService.java`
- [x] `src/main/java/com/serhat/secondhand/order/application/OrderNotificationService.java`
- [x] `src/main/java/com/serhat/secondhand/offer/email/OfferEmailNotificationService.java`
- [x] `src/main/java/com/serhat/secondhand/user/application/UserNotificationService.java`
- [x] Dalga 2 kapsaminda dogrudan `createAndSend` kullanimlari temizlendi
- [ ] Kalan tek dogrudan kullanim (Dalga 3): `src/main/java/com/serhat/secondhand/order/application/OrderCompletionScheduler.java:167`

### Dalga 3 Execution (Tamamlandi)

- [x] `src/main/java/com/serhat/secondhand/order/application/OrderCompletionScheduler.java` scheduler status-change bildirimi event publish'e tasindi
- [x] `src/main/java/com/serhat/secondhand/agreements/application/AgreementUpdateWatcher.java` broadcast bildirimi event publish'e tasindi
- [x] Broadcast icin yeni event sozlesmesi eklendi: `src/main/java/com/serhat/secondhand/notification/application/event/NotificationBroadcastRequestedEvent.java`
- [x] `NotificationEventPublisher` broadcast publish metodu eklendi
- [x] `NotificationDispatchRequestedEventListener` icine async broadcast consumer eklendi
- [x] Uretici katmaninda dogrudan `createAndSend/createBroadcast` kullanimlari temizlendi (yalnizca notification consume katmaninda kaldi)

### Payment Event Merkezi Yapi (Tamamlandi)

- [x] `PaymentCompletedEvent` icin merkezi consumer eklendi: `src/main/java/com/serhat/secondhand/payment/application/PaymentCompletedEventListener.java`
- [x] Merkezi consumer `@TransactionalEventListener(AFTER_COMMIT)` olarak calisacak sekilde ayarlandi
- [x] Listing odeme etkileri ayrildi: `src/main/java/com/serhat/secondhand/listing/application/common/ListingPaymentHandler.java`
- [x] Eski `ListingEventListener` uyumluluk katmani olarak birakildi ve merkezi akistan cikarildi
