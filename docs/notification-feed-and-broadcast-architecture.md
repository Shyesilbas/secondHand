# Bildirim Dağıtımı ve Broadcast Feed Mimarisi

Bu doküman uygulama içi bildirimlerin nasıl üretildiğini, saklandığını, tek bir feed olarak okunduğunu ve WebSocket ile anlık iletildiğini anlatır. Kod blokları projeden alınmıştır. Modül özeti: [notification/README.md](../src/main/java/com/serhat/secondhand/notification/README.md).

İlgili dokümanlar: WebSocket kanalları [websocket-stomp-and-chat-architecture.md](websocket-stomp-and-chat-architecture.md), e-posta [email-architecture-and-event-driven-dispatch.md](email-architecture-and-event-driven-dispatch.md).

---

## 1. İki tür bildirim, üç tablo

Tüm kullanıcılara giden bir duyuruyu her kullanıcı için ayrı satır olarak yazmak (fan-out) kullanıcı sayısı kadar insert demektir. Bunun yerine duyuru tek satır olarak saklanır; kullanıcı başına yalnızca "okudu" bilgisi tutulur.

| Tablo | Entity | İçerik |
| :--- | :--- | :--- |
| `notifications` | `Notification` | Tek kullanıcıya özel bildirim (sipariş, teklif, mesaj, ödeme). `is_read` satırın üzerindedir. |
| `notification_events` | `NotificationEvent` | Herkese açık broadcast; kullanıcı id'si taşımaz, **tek satır**. |
| `notification_event_reads` | `NotificationEventRead` | Bir kullanıcının bir broadcast'i okuduğunu gösteren `(eventId, userId, readAt)` satırı. |

Bildirim tipleri `NotificationType` enum'undadır: `OFFER_*`, `ORDER_*`, `CHAT_MESSAGE_RECEIVED`, `LISTING_PRICE_DROPPED`, `LISTING_NEW_FROM_FOLLOWED`, `LISTING_SOLD`, `LISTING_FAVORITED`, `REVIEW_RECEIVED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `AGREEMENT_UPDATED`, `GREAT_SELLER_ACHIEVED`.

---

## 2. Üretim akışı

```
[Domain servisi: offer, chat, payment, follow, favorite, user ...]
        │  notificationEventPublisher.publishDispatch(request, "offer", dedupKey)
        │  notificationEventPublisher.publishBroadcast(request, ...)
        ▼
[Spring ApplicationEvent: NotificationDispatchRequestedEvent / NotificationBroadcastRequestedEvent]
        │
        ▼  AFTER_COMMIT + @Async("notificationExecutor")
[NotificationDispatchRequestedEventListener]
        │
        ├── createAndSend   → notifications tablosu       → WebSocket /user/{userId}/notifications
        └── createBroadcast → notification_events tablosu → WebSocket /topic/notifications
```

Domain servisleri `NotificationService`'i doğrudan çağırmaz; [`NotificationEventPublisher`](../src/main/java/com/serhat/secondhand/notification/application/NotificationEventPublisher.java) üzerinden event yayınlar:

```java
public void publishDispatch(NotificationRequest request, String sourceModule, String dedupKey) {
    eventPublisher.publishEvent(new NotificationDispatchRequestedEvent(request, sourceModule, dedupKey));
}
```

[`NotificationDispatchRequestedEventListener`](../src/main/java/com/serhat/secondhand/notification/application/NotificationDispatchRequestedEventListener.java) event'i çağıranın transaction'ı **commit olduktan sonra** ve ayrı bir thread'de işler:

```java
@Async("notificationExecutor")
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
public void handle(NotificationDispatchRequestedEvent event) {
    var result = notificationService.createAndSend(event.request());
    if (result.isError()) {
        log.error("Async notification dispatch failed. sourceModule={}, dedupKey={}, error={}", ...);
    }
}
```

Bunun sonuçları:

- Ana işlem rollback olursa bildirim üretilmez.
- Bildirim hatası ana işlemi etkilemez; yalnızca loglanır.
- Bu yol **Kafka ya da outbox kullanmaz**. Commit ile listener arasında uygulama kapanırsa o bildirim kaybolur.
- `dedupKey` ve `sourceModule` yalnızca log içindir; `dedupKey`'e göre tekilleştirme yapan bir kod yoktur.

Örnek çağrı (`ChatNotificationService`): alıcıya `chat` kaynaklı bildirim, dedup key `chat-message:{recipientId}:{messageId}`.

---

## 3. Kayıt ve anlık iletim

[`NotificationService.createAndSend`](../src/main/java/com/serhat/secondhand/notification/application/NotificationService.java) bildirimi kaydeder ve hemen WebSocket'e yazar:

```java
Notification saved = notificationRepository.save(notification);
NotificationDto dto = notificationMapper.toDto(saved);
webSocketService.sendNotificationToUser(user.getId(), dto);
```

[`NotificationWebSocketService`](../src/main/java/com/serhat/secondhand/notification/application/NotificationWebSocketService.java):

| Metot | Hedef | Kim dinleyebilir |
| :--- | :--- | :--- |
| `sendNotificationToUser` | `/user/{userId}/notifications` | Yalnızca o kullanıcı (subscription allowlist'i) |
| `sendBroadcast` | `/topic/notifications` | Bağlı tüm kullanıcılar |

- Mesaj `convertAndSend` ile bu literal hedefe yazılır; hedefte `/queue` parçası yoktur.
- Push hatası yakalanıp loglanır; bildirim DB'de kaldığı için kullanıcı feed'i açtığında görür.
- Broker JVM içi simple broker'dır: bir instance'ın yayınladığı push, başka instance'a bağlı kullanıcıya ulaşmaz (bildirim yine DB'dedir).
- Kullanıcı bulunamazsa `USER_NOT_FOUND` döner. Toplu gönderim için `createAndSendBulk` tek `saveAll` yapar ve her kayıt için ayrı push gönderir.

---

## 4. Feed sorgusu

`GET /api/v1/notifications` kişisel bildirimleri ve broadcast'leri tek sayfalı listede döner. [`NotificationFeedRepository.findFeed`](../src/main/java/com/serhat/secondhand/notification/repository/NotificationFeedRepository.java) bunu native `UNION ALL` ile yapar:

```sql
select n.id, n.user_id as userId, n.type, ..., n.is_read as isRead, n.read_at as readAt, n.created_at as createdAt
from notifications n
where n.user_id = :userId
  and n.type <> 'AGREEMENT_UPDATED'
  and (cast(:unreadOnly as boolean) = false or n.is_read = false)

union all

select e.id, cast(:userId as bigint) as userId, e.type, ...,
       case when r.user_id is null then false else true end as isRead,
       r.read_at as readAt, e.created_at as createdAt
from notification_events e
left join notification_event_reads r on r.event_id = e.id and r.user_id = :userId
where e.type <> 'AGREEMENT_UPDATED'
  and (cast(:unreadOnly as boolean) = false or r.user_id is null)

order by createdAt desc
```

- Broadcast'in okundu bilgisi `notification_event_reads` ile `LEFT JOIN`'den gelir: satır varsa okunmuş.
- `AGREEMENT_UPDATED` tipi feed'de ve okunmamış sayacında **gösterilmez**.

### Okunmamış sayısı

```java
long personal = notificationRepository.countByUser_IdAndIsReadFalseAndTypeNot(userId, NotificationType.AGREEMENT_UPDATED);
long totalEvents = notificationEventRepository.countByTypeNot(NotificationType.AGREEMENT_UPDATED);
long reads = notificationEventReadRepository.countByUserIdForEventsWithTypeNot(userId, NotificationType.AGREEMENT_UPDATED);
long broadcastUnread = Math.max(0, totalEvents - reads);
return personal + broadcastUnread;
```

Broadcast için "toplam − okuduklarım" hesabı yapılır. Dikkat: kullanıcı kayıt olmadan önce yayınlanmış broadcast'ler de okunmamış sayılır.

### Okundu işaretleme

- `PUT /api/v1/notifications/{id}/read`: id önce `notifications`'ta aranır. Bulunursa sahibi kontrol edilir (`NOTIFICATION_NOT_BELONGS_TO_USER`) ve `isRead = true` yapılır. Bulunamazsa `notification_events`'te aranır ve `(eventId, userId)` satırı yoksa eklenir. İkisinde de yoksa `NOTIFICATION_NOT_FOUND`.
- `PUT /api/v1/notifications/read-all`: kişisel bildirimlerin hepsini okundu yapar, okunmamış her broadcast için read satırı ekler.
- Her iki metot `@CacheEvict(value = "user:badges", key = "#userId")` taşır; badge sayısı sonraki okumada yeniden hesaplanır (`user:badges` TTL 5 dk).

---

## 5. API

| Endpoint | Açıklama |
| :--- | :--- |
| `GET /api/v1/notifications` | Sayfalı feed (`unreadOnly` filtresi) |
| `GET /api/v1/notifications/unread-count` | Okunmamış sayısı |
| `PUT /api/v1/notifications/{id}/read` | Tek bildirimi okundu yapar |
| `PUT /api/v1/notifications/read-all` | Tümünü okundu yapar |

## 6. Bildirim üreten modüller

| Modül | Sınıf | Örnek |
| :--- | :--- | :--- |
| `offer` | `OfferEmailNotificationService` | Teklif alındı, kabul/ret, counter-offer, süre doldu |
| `chat` | `ChatNotificationService` | Yeni mesaj |
| `payment` | `PaymentNotificationService` | Ödeme başarılı |
| `follow` | `SellerFollowService`, `NewListingNotificationListener` | Takip edilen satıcıdan yeni ilan |
| `favorite` | `FavoriteService` | İlan favorilendi |
| `user` | `UserNotificationService`, `GreatSellerEligibilitySyncService` | Kullanıcı bildirimleri, Great Seller rozeti |

Başlık ve metinler [`NotificationTemplateCatalog`](../src/main/java/com/serhat/secondhand/notification/template/NotificationTemplateCatalog.java) içinden gelir.

## 7. Bilinen sınırlar

- Dağıtım JVM içi event ile yapılır; kalıcı kuyruk yoktur (§2).
- Yeni bildirim oluşturmak `user:badges` cache'ini temizlemez; cache'teki sayı en fazla 5 dakika eski kalabilir. Anlık güncelleme WebSocket push'u ile sağlanır.
- Okunmamış broadcast sayısı tüm broadcast satırları üzerinden hesaplanır; kullanıcının kayıt tarihinden eski broadcast'ler de sayılır.
