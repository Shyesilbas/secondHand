# WebSocket, STOMP ve Canlı Mesajlaşma Mimarisi

Bu doküman, **secondHand** platformunun gerçek zamanlı mesajlaşma (Chat) ve canlı event iletim altyapısını oluşturan **Spring WebSocket**, **STOMP Protokolü**, **HttpOnly Cookie Handshake**, **Channel Seviyesinde JWT Güvenliği**, **IDOR Korumalı Subscription Yetkilendirmesi** ve **Sohbet İçi Teklif (In-Chat Offer)** akışlarını detaylandırmaktadır.

---

## 1. Mimari Genel Bakış

Platformda kullanıcılar arası anlık mesajlaşma ve bildirim iletimi, geleneksel HTTP polling yerine çift yönlü, düşük gecikmeli **WebSocket + STOMP (Simple Text Oriented Messaging Protocol)** ile sağlanır:

```
[Client / React UI]
        │
        ├── 1. HTTP GET /ws (Handshake / CookieHandshakeInterceptor)
        │      └── "sh_at" HttpOnly çerezinden JWT okunur -> session attribute'a yazılır.
        │
        ├── 2. STOMP CONNECT Frame
        │      └── WebSocketSecurityConfig: JWT doğrulanır, SecurityContext / Principal bağlanır.
        │
        ├── 3. STOMP SUBSCRIBE Frame (/topic/chat/{roomId})
        │      └── ChannelInterceptor -> ChatAuthorizationService (Oda üyesi mi? Yetkisizse REDDET).
        │
        └── 4. STOMP SEND Frame (/app/chat.sendMessage)
               └── ChatWebSocketController -> ChatService.sendMessage -> MessageRepository
                   -> ChatNotificationService -> /topic/chat/{roomId} (+ recipient için notification dispatch)
```

---

## 2. Handshake ve Çok Katmanlı Güvenlik Modeli

### A. HttpOnly Cookie Handshake: [`WebSocketConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketConfig.java)
- **Endpoint:** `/ws` (düz WebSocket; SockJS fallback'i yoktur).
- **Origin Politikası:** Wildcard (`*`) kullanılmaz. `CorsConfigProperties.allowedOrigins` kullanılır; liste boşsa `http://localhost:5173`'e düşer.
- **Simple broker:** `/topic`, `/queue`, `/user` prefix'leri için in-memory simple broker; uygulama prefix'i `/app`. Broker JVM içidir, relay yoktur: çoklu node'da bir node'dan yayınlanan mesaj yalnızca o node'a bağlı client'lara gider.
- **`CookieHandshakeInterceptor`:** Tarayıcı güvenliği gereği JavaScript tarafından okunamayan `sh_at` (Access Token) çerezini HTTP Handshake aşamasında yakalar ve WebSocket oturum özniteliğine (`ws_token`) aktarır. Çerez yoksa handshake yine geçer; reddetme CONNECT aşamasında yapılır.

---

### B. Channel Seviyesinde Güvenlik ve IDOR Engelleme: [`WebSocketSecurityConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketSecurityConfig.java)

WebSocket protokolünde HTTP filtreleri (Spring Security Filter Chain) yalnızca ilk handshake'te devreye girer. Handshake sonrasındaki her bir STOMP çerçevesi (frame) için mesaj broker seviyesinde güvenlik `ChannelInterceptor` ile sağlanır:

1. **CONNECT Doğrulaması (`authenticateConnect`):**
   - Önce STOMP `Authorization: Bearer <token>` başlığı, yoksa handshake'ten gelen `ws_token` okunur. Token yoksa `WebSocket authentication required`, geçersizse `WebSocket authentication failed` ile bağlantı reddedilir.
   - Kullanıcı `UserDetailsService` ile yüklenir ve `UsernamePasswordAuthenticationToken` olarak `accessor.setUser(...)` içine yazılır. `userId`, `iat` ve `jti` session attribute'larında saklanır.
   - Token CONNECT anında `AccessRevocationService.isRevoked` ile de kontrol edilir (`WebSocket token revoked`).
2. **Kimliksiz İstek ve Revocation Koruması:**
   - `SUBSCRIBE`, `SEND`, `UNSUBSCRIBE` komutlarında kimlik zorunludur (`WebSocket authentication required`).
   - Açık bağlantıda da her bu komutta `rejectIfRevoked` çalışır: ban veya logout sonrası mevcut bağlantı SUBSCRIBE/SEND yapamaz.
3. **SEND Kısıtı (`authorizeSend`):** Yalnızca `/app/` hedeflerine SEND yapılabilir; `/topic`, `/queue`, `/user`'a doğrudan SEND reddedilir (sahte bildirim/mesaj engeli).
4. **Subscription Allowlist'i (`authorizeSubscription`):**
   - `*`, `?`, `{`, `}`, `..` içeren hedefler reddedilir (`Invalid subscription destination`).
   - İzin verilenler: `/topic/notifications`, kullanıcının katılımcısı olduğu `/topic/chat/{roomId}` ve yalnızca kendi `/user/{userId}/...` hedefleri. Diğer her şey `Subscription destination not allowed`.
   - Chat odası için `ChatAuthorizationService.validateRoomParticipant(roomId, userId)` çağrılır; katılımcı değilse `Not a participant of chat room`, `roomId` sayı değilse `Invalid chat subscription` (IDOR koruması).

---

## 3. STOMP Kanal ve Rota Yapısı

| Hedef | Yön | Açıklama |
| :--- | :--- | :--- |
| **`/ws`** | Endpoint | STOMP bağlantı ve handshake noktası. |
| **`/app/chat.sendMessage`** | SEND | Odaya mesaj; `senderId` principal ile eşleşmeli, `ChatService.sendMessage` çağrılır. |
| **`/app/chat.joinRoom`** | SEND | `chatRoomId`/`userId`'yi yalnızca WebSocket session attribute'larına yazar; DB veya broker yan etkisi yoktur. |
| **`/app/chat.leaveRoom`** | SEND | Bu session attribute'larını siler. |
| **`/app/chat.markAsRead`** | SEND | `ChatService.markMessagesAsRead`; DB'de okundu işaretler, karşı tarafa push yoktur. |
| **`/topic/chat/{roomId}`** | Broker | `ChatNotificationService.sendMessage` ile oda mesajı yayını (normal ve OFFER mesajları). |
| **`/topic/notifications`** | Broker | Herkese açık broadcast bildirim (`NotificationWebSocketService.sendBroadcast`). |
| **`/user/{userId}/notifications`** | Broker | Kullanıcıya özel bildirim (`NotificationWebSocketService.sendNotificationToUser`); `convertAndSend` ile literal hedefe yazılır (`/queue` segmenti yoktur). |

--- | :--- | :--- |
| **`/ws`** | Endpoint | STOMP bağlantı ve handshake noktası. |
| **`/app/chat.sendMessage`** | Giriş (SEND) | Kullanıcıdan odaya yeni mesaj gönderimi. |
| **`/app/chat.joinRoom`** | Giriş (SEND) | Kullanıcının odaya giriş bildirimi. |
| **`/app/chat.leaveRoom`** | Giriş (SEND) | Kullanıcının odadan ayrılma bildirimi. |
| **`/app/chat.markAsRead`** | Giriş (SEND) | Mesajların okundu olarak işaretlenmesi. |
| **`/topic/chat/{roomId}`** | Çıkış (BROKER) | İlgili odadaki katılımcılara anlık mesaj ve olay yayını. |
| **`/user/{userId}/queue/notifications`** | Çıkış (USER) | Kullanıcıya özel anlık bildirim ve uyarı iletimi. |

---

## 4. Sohbet Olayları ve İlan İçi Teklif (In-Chat Offer)

Sohbet akışı yalnızca düz metin mesajlarından ibaret değildir; pazar yeri dinamiklerine bağlı yan etkiler içerir:

1. **Sohbet İçi Teklif Verme (`SendInChatOfferRequest`):**
   - `POST /api/v1/chats/rooms/{chat-room-id}/offers` (REST) → `ChatService.sendInChatOffer`. Oda katılımcısı olmak ve odanın bir ilana bağlı olması zorunludur; aksi halde `SecurityException` / `IllegalArgumentException`.
   - `OfferService.create` ile teklif açılır, aynı transaction'da `MessageType.OFFER` mesajı kaydedilir, teklif alanlarıyla zenginleştirilip `/topic/chat/{roomId}`'ye yayınlanır.
   - Geçmiş mesajlar okunurken (`getChatMessages`) OFFER kartı `enrichOfferMessage` ile güncel teklif durumundan doldurulur.
2. **Oda Zenginleştirme (`ChatRoomEnricher`):**
   - `GET /api/v1/chats/rooms/user` sayfalı döner; `ChatRoomEnricher` her oda için ilan bilgisi, karşı taraf ve okunmamış sayısını `ChatRoomDto`'ya ekler.
3. **Okunmamış Mesaj Takibi:**
   - Frontend okundu işaretini REST ile yapar (`PUT /api/v1/chats/rooms/{chat-room-id}/messages/read`); STOMP `/app/chat.markAsRead` aynı servisi çağırır. İki yol da yalnızca DB'yi günceller, karşı tarafa okundu eventi yayınlanmaz.
4. **Mesaj Bildirimi:** `ChatNotificationService.sendMessage`, oda yayınına ek olarak alıcıya `chat` kaynaklı bir notification dispatch'i publish eder (dedupe key `chat-message:{recipientId}:{messageId}`); ayrıntı için [bildirim dokümanı](notification-feed-and-broadcast-architecture.md).

---

## 5. Hata Yönetimi ve Resilience

- **Gönderen Eşleme Denetimi:** `sendMessage`, `joinRoom` ve `markAsRead` içinde payload `senderId` ile principal `user.getId()` karşılaştırılır; uyuşmazlıkta mesaj sessizce loglanıp düşürülür (client'a hata dönmez). `leaveRoom` bu kontrolü yapmaz.
- **Yetki Hataları:** `ChatService` oda/participant ihlalinde `SecurityException`, geçersiz içerikte `IllegalArgumentException` fırlatır; STOMP üzerinden gelen bu hatalar client'a özel bir error frame ile dönmez (REST `POST /api/v1/chats/messages` yolunda HTTP hatasına çevrilir).
- **Revocation:** Ban/logout olan kullanıcının açık bağlantısı bir sonraki SUBSCRIBE/SEND'de reddedilir; mevcut subscription'lar broker'dan aktif olarak düşürülmez.
- **Reconnect:** Frontend (`useWebSocket.js`, `useNotificationWebSocket.js`) kopmada exponential backoff (1 sn'den başlar, üst sınır 30 sn) ve en fazla 10 deneme ile yeniden bağlanır. Her bağlantı `sh_at` çerezini yeniden okur; çerez süresi dolmuşsa CONNECT reddedilir.
- **Notification push hatası:** `NotificationWebSocketService` exception'ı yakalayıp loglar; push kaybolsa da bildirim DB'de kalır.

---

## 6. İlgili Dosyalar

- WebSocket Konfigürasyonu: [`WebSocketConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketConfig.java)
- Kanal Güvenliği: [`WebSocketSecurityConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketSecurityConfig.java)
- STOMP Controller: [`ChatWebSocketController.java`](../src/main/java/com/serhat/secondhand/chat/controller/ChatWebSocketController.java)
- Yetkilendirme Servisi: [`ChatAuthorizationService.java`](../src/main/java/com/serhat/secondhand/chat/application/ChatAuthorizationService.java)
- REST API: [`ChatRestController.java`](../src/main/java/com/serhat/secondhand/chat/api/ChatRestController.java)
- Yayın servisleri: [`ChatNotificationService.java`](../src/main/java/com/serhat/secondhand/chat/notification/ChatNotificationService.java), [`NotificationWebSocketService.java`](../src/main/java/com/serhat/secondhand/notification/application/NotificationWebSocketService.java)
