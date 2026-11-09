# Sipariş (Order) Yaşam Döngüsü, İptal/İade Compensation ve Teslimat Mimarisi Rehberi

Bu doküman, **secondHand** platformundaki **Sipariş Durum Makinesi (Order State Machine)**, **Kargo & Güvenli Buluşma (Safe Meetup) Akışları**, **Kalem Bazlı İptal & İade Compensation Yönetimi (Compensation Planner)** ve **Transactional Outbox Event Pipeline'ını** detaylandırmaktadır.

---

## 1. Genel Sipariş Mimarisi ve Çift Teslimat Yolu

Siparişler, ikinci el platformunun doğası gereği iki farklı teslimat yöntemiyle işlenir:
1. **Kargo ile Teslimat (`CARGO`):** Standart kargo takibi ve teslimat onay süreci.
2. **Güvenli Buluşma (`SAFE_MEETUP`):** Alıcı ve satıcının yüz yüze buluşup OTP / doğrulama kodu ile teslimatı gerçekleştirdiği yerel akış.

---

## 2. Uçtan Uca Sipariş Durum Makinesi (Order State Machine)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Sipariş oluşturuldu (CARGO)
    [*] --> MEETUP_PENDING: Sipariş oluşturuldu (SAFE_MEETUP, doğrulama kodu üretilir)
    PENDING --> CONFIRMED: Ödeme alındı ve escrow.hold
    PENDING --> CANCELLED: Ödeme başarısız

    CONFIRMED --> PROCESSING: Scheduler (zaman bazlı)
    PROCESSING --> SHIPPED: Satıcı /ship
    SHIPPED --> DELIVERED: Scheduler (zaman bazlı)
    DELIVERED --> COMPLETED: Alıcı onayı veya 72 saat
    DELIVERED --> REFUNDED: İade (48 saat içinde, tüm kalemler)

    MEETUP_PENDING --> HANDOVER_CONFIRMED: Kod doğrulandı
    MEETUP_PENDING --> VERIFICATION_LOCKED: 3 hatalı kod
    VERIFICATION_LOCKED --> MEETUP_PENDING: 15 dk sonra
    MEETUP_PENDING --> COMPLETED: Alıcı manuel onay
    HANDOVER_CONFIRMED --> COMPLETED: Alıcı/satıcı onayı veya 24 saat

    CONFIRMED --> CANCELLED: Alıcı iptali veya 72 saat kargolanmama
    PROCESSING --> CANCELLED: 72 saat kargolanmama (yalnızca sistem)
    MEETUP_PENDING --> CANCELLED: Alıcı iptali veya 7 gün

    COMPLETED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

---

## 3. Sipariş Durumları ve İşlem Yetki Matrisi ([`OrderStatus.java`](../src/main/java/com/serhat/secondhand/order/entity/enums/OrderStatus.java))

| Durum | Açıklama | İptal Edilebilir (`isCancellable`) | İade Edilebilir (`isRefundable`) | Adres/Not Değişebilir (`isModifiable`) | Tamamlanabilir (`isCompletable`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`PENDING`** | Ödeme bekleniyor (checkout transaction'ı içinde kısa süreli) | Evet | Hayır | Evet | Hayır |
| **`CONFIRMED`** | Ödeme alındı, Escrow'da bloke | Evet | Hayır | Evet | Hayır |
| **`PROCESSING`** | Satıcı siparişi paketliyor | Hayır | Hayır | Hayır | Hayır |
| **`SHIPPED`** | Kargoya verildi, yolda | Hayır | Hayır | Hayır | Hayır |
| **`DELIVERED`** | Alıcıya teslim edildi (İnceleme süresi) | Hayır | Evet | Hayır | Evet |
| **`MEETUP_PENDING`** | Güvenli buluşma bekleniyor (ödeme sonrası) | Evet | Hayır | Hayır | Hayır |
| **`VERIFICATION_LOCKED`** | 3 hatalı kod sonrası 15 dk kilit ([detay](safe-meetup-delivery-and-verification.md)) | Hayır | Hayır | Hayır | Hayır |
| **`HANDOVER_CONFIRMED`** | Buluşmada ürün elden teslim edildi | Hayır | Hayır | Hayır | Evet |
| **`COMPLETED`** | Onaylandı; para satıcıya aktarıldı | Hayır | Hayır | Hayır | Hayır |
| **`CANCELLED`** | Tüm kalemler iptal edildi; para alıcıya iade edildi | Hayır | Hayır | Hayır | Hayır |
| **`REFUNDED`** | Tüm kalemler iade edildi; para alıcıya döndü | Hayır | Hayır | Hayır | Hayır |

Set'ler `OrderStatus` içindeki `CANCELLABLE_STATUSES`, `REFUNDABLE_STATUSES`, `MODIFIABLE_STATUSES`, `COMPLETABLE_STATUSES` sabitleridir. `Order.markAsProcessing/markAsShipped/markAsDelivered` geçersiz kaynak durumda `IllegalStateException` fırlatır.

---

## 4. Kalem Bazlı İptal ve İade Compensation Yönetimi (Item-Level Compensation)

Bir siparişte farklı satıcılara ait birden fazla ürün bulunabilir. Bu nedenle iptal ve iade işlemleri hem **tüm sipariş** hem de **tek bir ürün kalemi (`OrderItem`)** bazında bağımsız işletilebilir.

### A. İptal Akışı ([`OrderCancellationService.java`](../src/main/java/com/serhat/secondhand/order/application/OrderCancellationService.java))
* **Yetki:** Yalnızca siparişin alıcısı (`OrderValidationService.validateOwnership` → `ORDER_NOT_BELONG_TO_USER`). Satıcı iptal edemez.
* **Koşul:** Durum `PENDING`, `CONFIRMED` veya `MEETUP_PENDING` olmalıdır. `COMPLETED` için `ORDER_ALREADY_COMPLETED`, diğer durumlar için `ORDER_CANNOT_BE_CANCELLED`.
* **Adımlar (tek transaction):**
  1. [`OrderItemCompensationPlanner`](../src/main/java/com/serhat/secondhand/order/application/OrderItemCompensationPlanner.java) iptal edilecek kalemleri ve miktarları planlar. Kalem zaten tamamen iptal edilmişse `ORDER_ITEM_ALREADY_CANCELLED`.
  2. Her kalem için `OrderItemCancel` audit kaydı yazılır.
  3. Stok **senkron** geri alınır: `InventoryService.restoreQuantity` (PostgreSQL, aynı transaction) ve commit sonrası `InventoryRedisReservationService.releaseStock` (Redis). Redis hatası yutulur, reconciliation scheduler düzeltir. `REAL_ESTATE` ve `VEHICLE` için stok geri alınmaz.
  4. [`EscrowService.cancel`](../src/main/java/com/serhat/secondhand/escrow/application/EscrowService.java) escrow'u `CANCELLED` yapar ve parayı alıcının e-cüzdanına `REFUND` olarak yazar. Hata dönerse transaction rollback-only yapılır ve `REFUND_FAILED` döner.
  5. `Order.applyCancellation`: tüm kalemler iptal edildiyse sipariş `CANCELLED` + `paymentStatus=REFUNDED`; kısmi iptalde sipariş durumu değişmez, `paymentStatus=PARTIALLY_REFUNDED` olur.
  6. [`OrderOutboxService`](../src/main/java/com/serhat/secondhand/order/outbox/OrderOutboxService.java) `ORDER_CANCELLED` kaydını yazar; `OrderOutboxWorker` (5 sn) bunu `order.cancelled.v1` topic'ine publish eder.
* **Not:** `order.cancelled.v1` ve `order.refunded.v1` için kod tabanında `@KafkaListener` yoktur; stok geri alma bu event'lere bağlı değildir (adım 3). Event'ler dış consumer'lar içindir.
* **Sistem iptali:** `cancelUnshippedOrder` aynı compensation'ı tüm kalemler için çalıştırır (neden `DELIVERED_DELAY` yerine `CancelRefundReason.DELAYED_DELIVERY`, metin `Not shipped within 72 hours`).

---

### B. İade Akışı ([`OrderRefundService.java`](../src/main/java/com/serhat/secondhand/order/application/OrderRefundService.java))
* **Yetki:** Yalnızca alıcı.
* **Koşul ([`OrderRefundPolicy`](../src/main/java/com/serhat/secondhand/order/policy/OrderRefundPolicy.java)):** Sipariş `DELIVERED` olmalı ve `shipping.deliveredAt` dolu olmalıdır; teslimden itibaren `REFUND_WINDOW_HOURS` (48 saat) geçtiyse `REFUND_TIME_EXPIRED`. `COMPLETED` için `ORDER_ALREADY_COMPLETED`, diğer durumlar için `ORDER_CANNOT_BE_REFUNDED`.
* **Adımlar (tek transaction):**
  1. `OrderItemRefund` kaydı (neden: `CancelRefundReason`) yazılır; kalem zaten tamamen iade edildiyse `ORDER_ITEM_ALREADY_REFUNDED`.
  2. Stok iptaldeki gibi senkron geri alınır.
  3. `EscrowService.refund` escrow'u `REFUNDED` yapar, `refundedAt` yazar ve alıcıya `REFUND` kredisi verir. Hata → rollback-only + `REFUND_FAILED`.
  4. `Order.applyRefund`: tüm kalemler iade edildiyse `REFUNDED`; aksi halde `paymentStatus=PARTIALLY_REFUNDED`.
  5. `ORDER_REFUNDED` outbox kaydı → `order.refunded.v1`.

---

## 5. Otomasyon & Tamamlama Scheduler'ı ([`OrderCompletionScheduler.java`](../src/main/java/com/serhat/secondhand/order/application/OrderCompletionScheduler.java))

`autoUpdateOrderStatus` her `STATUS_UPDATE_INTERVAL_MINUTES` (5 dk) çalışır. Süreler [`OrderBusinessConstants`](../src/main/java/com/serhat/secondhand/order/util/OrderBusinessConstants.java) içindedir:

| Adım | Koşul | Sonuç |
| :--- | :--- | :--- |
| `CONFIRMED` → `PROCESSING` | `updatedAt` üzerinden 5 dk (premium kullanıcıda `5/2` = 2 dk) | `markAsProcessing` |
| `SHIPPED` → `DELIVERED` | `shipping.inTransitAt` (yoksa `updatedAt`) üzerinden aynı süre | `markAsDelivered` |
| `CONFIRMED`/`PROCESSING` (`CARGO`) → `CANCELLED` | `createdAt` + 72 saat (`SHIP_DEADLINE_HOURS`) | `cancelUnshippedOrder`: stok + escrow refund |
| `DELIVERED` → `COMPLETED` | `deliveredAt` + 72 saat (`AUTO_COMPLETION_HOURS`) | `escrowService.release`, sonra `applyCompletion` |
| `HANDOVER_CONFIRMED` → `COMPLETED` | `meetupVerifiedAt` + 24 saat (sabit değil, scheduler içinde) | `escrowService.release` |
| `MEETUP_PENDING` → `CANCELLED` | `createdAt` + 7 gün | `escrowService.cancel`, `paymentStatus=REFUNDED` |

* `PROCESSING` → `SHIPPED` zamanla değil, satıcının `PUT /api/v1/orders/{order-id}/ship` çağrısıyla olur.
* `MEETUP_PENDING` bayat iptali yalnızca escrow'u iptal edip refund eder; `OrderItemCancel` kaydı yazmaz, stok geri almaz ve outbox event'i üretmez.
* **Çalışma şekli:** Her adım önce vadesi gelmiş olabilecek sipariş id'lerini DB'de zaman filtresiyle çeker (adım başına en fazla `BATCH_SIZE` = 200, `OrderRepository.findIdsByStatus*`). Ardından her sipariş kendi transaction'ında yeniden yüklenir, durum ve süre kuralı tekrar kontrol edilir. Bir siparişteki hata yalnızca o siparişi geri alır, kalanlar işlenmeye devam eder ve hatalı sipariş sonraki çalışmada tekrar denenir. Çok instance'lı çalışmada aynı anda tek çalıştırma garantisi (ShedLock vb.) yoktur.

---

## 6. Hata ve Eşzamanlılık Güvenceleri

| Risk / Senaryo | Mimari Koruma |
| :--- | :--- |
| **Kargoya Verilmiş Ürünü İptal Etmeye Çalışma** | `OrderCancellationPolicy` → `ORDER_CANNOT_BE_CANCELLED` (`SHIPPED`, `DELIVERED`, `PROCESSING` vb.). |
| **Tamamlanmış (`COMPLETED`) Siparişi İptal/İade Etme** | `ORDER_ALREADY_COMPLETED`; para satıcıya gittiği için compensation yapılmaz. |
| **İade Penceresi Dışında İade** | Teslimden 48 saat sonra `REFUND_TIME_EXPIRED`. |
| **Aynı Kalemi İki Kez İptal/İade** | Planner `ORDER_ITEM_ALREADY_CANCELLED` / `ORDER_ITEM_ALREADY_REFUNDED` döner; ayrıca escrow katmanında `ESCROW_NOT_FOUND` / `ESCROW_STATUS_INVALID` kontrolü vardır. |
| **Escrow Refund Hatası** | Transaction rollback-only yapılır (stok ve `OrderItemCancel`/`OrderItemRefund` kayıtları da geri alınır), `REFUND_FAILED` döner. |
| **Dual-Write Olay Kaybı** | İptal/iade event'leri Kafka'ya doğrudan değil `order_outbox_events` üzerinden gider. |
| **Aynı Anda İptal ve Onay** | `EscrowRepository.findByOrderItemIdInForUpdate` / `findByOrderIdAndStatusForUpdate` ile satır düzeyinde `PESSIMISTIC_WRITE` lock alınır; ikinci işlem escrow'u `ESCROW` durumunda bulamaz. |
| **Escrow Release Hatası (Scheduler)** | Sipariş `COMPLETED` yapılmaz, sonraki çalışmada yeniden denenir. Manuel onayda `ORDER_COMPLETION_ESCROW_RELEASE_FAILED` döner. |
