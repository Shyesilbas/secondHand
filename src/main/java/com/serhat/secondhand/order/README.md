# Order Modülü

Sipariş yaşam döngüsü: sepetten sipariş oluşturma, ödeme, escrow, kargo durumu, otomatik ve manuel tamamlama, iptal ve iade. Ödeme cüzdan hareketleri `payment` modülündeki `PaymentOrchestrator` üzerinden yapılır; order tarafı sipariş/escrow kayıtlarını ve iş kurallarını yönetir.

---

## Paket Yapısı

```
order/
├── api/                    → OrderController (checkout, sorgu, iptal, iade, tamamlama)
├── application/            → Servisler, event'ler, listener'lar
│   ├── event/              → OrderCreatedEvent, OrderCompletedEvent, OrderCancelledEvent, …
│   └── listener/           → OrderEmailListener, OrderNotificationListener
├── dto/                    → CheckoutRequest, OrderDto, iptal/iade istekleri
├── entity/                 → Order, OrderItem, Shipping, OrderItemEscrow, iptal/iade kayıtları
├── entity/enums/           → ShippingStatus, CancelRefundReason
├── mapper/                 → OrderMapper, ShippingMapper
├── policy/                 → Durum geçişi, iptal, iade, tamamlama kuralları
├── repository/             → JPA repository'ler
├── util/                   → OrderErrorCodes, OrderBusinessConstants
└── validator/              → OrderStatusConsistencyLogger (tutarsızlık loglama)
```

---

## Yaşam Döngüsü 

### 1. Checkout (giriş noktası)

`OrderController` → `CheckoutOrchestrator` (checkout modülü):

1. Fiyatlandırma bağlamı ve stok rezervasyonu  
2. `OrderCreationService.createOrder` — adres doğrulama, sipariş + kargo + kalemler, `OrderRepository.save`  
3. `OrderPaymentService` — satıcı başına ödeme istekleri, `PaymentProcessor`  
4. Başarılı ödemede `CheckoutOrchestrator` siparişi **PAID / CONFIRMED** yapar, `PaymentOrchestrator.createEscrowsForOrder` ile kalemler için escrow oluşturur  
5. Başarısız ödemede sipariş **FAILED / CANCELLED**, stok rezervi iade  
6. `OrderCreatedEvent` — ödeme başarılı/başarısız bilgisiyle yayınlanır  

Checkout, sipariş + ödeme + escrow’u tek transaction akışında birleştirir; detaylı ödeme motoru `payment` README’de.

### 2. Sipariş durumları (`Order.OrderStatus`)

Tipik akış (zamanlama sabitleri `OrderBusinessConstants`):

| Durum | Anlam |
|-------|--------|
| PENDING | Oluşturuldu, ödeme bekleniyor olabilir |
| CONFIRMED | Ödeme alındı, hazırlık aşaması |
| PROCESSING | İşleniyor (zamanlayıcı) |
| SHIPPED | Kargoda |
| DELIVERED | Teslim edildi |
| COMPLETED | Tamamlandı; escrow satıcıya serbest bırakıldı |
| CANCELLED | İptal |
| REFUNDED | İade işlendi |

`CANCELLABLE_STATUSES`, `REFUNDABLE_STATUSES`, `MODIFIABLE_STATUSES`, `COMPLETABLE_STATUSES` entity üzerinde merkezi tanımlı.

### 3. Otomatik ilerleme — `OrderCompletionScheduler`

Periyodik job (`@Scheduled`):

- CONFIRMED → PROCESSING → SHIPPED → DELIVERED (zaman eşiklerine göre, `Shipping` tarihleri güncellenir)  
- DELIVERED + teslimden belli süre sonra → **önce** `releaseEscrowsToSellers`, **başarılıysa** COMPLETED + `OrderCompletedEvent` + `OrderStatusChangedEvent`  

Escrow serbest bırakılamazsa sipariş COMPLETED yapılmaz; sonraki çalışmada tekrar denenir.

### 4. Manuel tamamlama — `OrderCompletionService`

Alıcı “teslim aldım” benzeri akış: politika + validasyon → escrow release → durum COMPLETED → `OrderCompletedEvent` (manuel bayrakla).

### 5. İptal — `OrderCancellationService`

Validasyon → `OrderItemCompensationPlanner` ile iptal planı → `PaymentOrchestrator.cancelEscrowsAndRefundBuyer` → kalıcı iptal kayıtları → `OrderCancelledEvent`.

### 6. İade — `OrderRefundService`

Teslim sonrası iade kuralları → `PaymentOrchestrator.refundFromSellersAndEscrows` → `OrderRefundedEvent`.

---

## Escrow ve Sorumluluk Ayrımı

| Katman | Rol |
|--------|-----|
| `EscrowCreateExecutor` (payment) | Checkout sonrası toplu escrow oluşturma (N+1’siz bulk) |
| `OrderEscrowService` | Escrow entity sorgu/durum; cüzdan hareketi yok |
| `PaymentOrchestrator` | Para: release, iptal+iade, refund |

---

## Domain Event’ler ve Yan Etkiler

Event’ler işlem commit’inden sonra dinlenir (`AFTER_COMMIT`), e-posta/bildirim ana transaction’ı bozmaz.

| Event | Tipik dinleyici |
|-------|------------------|
| `OrderCreatedEvent` | E-posta (başarılı ödeme), in-app |
| `OrderCompletedEvent` | Tamamlama bildirimleri |
| `OrderCancelledEvent` | İptal bildirimleri |
| `OrderRefundedEvent` | İade bildirimleri |
| `OrderStatusChangedEvent` | Durum değişikliği bildirimleri |

`OrderEmailListener` / `OrderNotificationListener` — ayrı sorumluluk (SRP).

---

## Politikalar (`policy/`)

- `OrderStateTransitionPolicy` — geçerli durum geçişleri  
- `OrderCancellationPolicy` / `OrderCancellationValidationService` — iptal edilebilirlik  
- `OrderRefundPolicy` — iade koşulları  
- `OrderCompletionPolicy` — tamamlanabilirlik  

İş kuralı değişince önce politika katmanına bakılır.

---

## Önemli Servisler (Özet Tablo)

| Servis | Görev |
|--------|--------|
| `OrderCreationService` | Sipariş + kalemler + shipping oluşturma |
| `OrderQueryService` | Alıcı/satıcı listesi ve detay; iptal/iade miktarlarını toplayıp mapper’a verir (N+1 önleme) |
| `OrderModificationService` | İsim, not, adres (modifiye edilebilir durumlarda) |
| `OrderValidationService` | Ortak sahiplik / erişim kontrolleri |
| `OrderItemCompensationPlanner` | İptal/iade için satır bazlı plan |
| `OrderCompensationPersistenceService` | İptal/iade kayıtlarının kalıcılığı |
| `OrderLogService` | Merkezi operasyon log’u |
| `OrderMapper` | Entity → DTO; repository inject etmez |

---

## Özet

Sipariş checkout’ta oluşturuluyor: fiyat ve stok rezervi sonrası `OrderCreationService` siparişi ve kalemleri kaydediyor. Ödeme `PaymentProcessor` ile satıcı başına parçalanıyor. Ödeme başarılıysa sipariş onaylanıyor ve her kalem için escrow açılıyor — para satıcıya hemen gitmiyor. Sonra ya zamanlayıcıyla kargo hattı simüle edilip teslim, ya da kullanıcı manuel tamamlıyor; her iki durumda da önce escrow serbest bırakılıyor, sonra COMPLETED. İptalde escrow iptal + alıcı iadesi, iadede satıcıdan kesip alıcıya refund. Bildirimler domain event’lerle, commit sonrası async ayrı listener’larda.

---

## İlişkili Modüller

- **checkout** — `CheckoutOrchestrator` (sipariş + ödeme + escrow + kupon/teklif)  
- **payment** — ödeme motoru ve escrow para akışı  
- **cart / pricing / listing / user** — sepet, fiyat, ilan, adres  

Daha fazla ödeme detayı için: `payment/README.md`.
