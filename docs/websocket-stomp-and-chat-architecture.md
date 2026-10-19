# WebSocket, STOMP ve Canlı Mesajlaşma Mimarisi

Bu doküman, **secondHand** platformunun gerçek zamanlı mesajlaşma (Chat) ve canlı olay iletim altyapısını oluşturan **Spring WebSocket**, **STOMP Protokolü**, **HttpOnly Cookie El Sıkışması**, **Kanal Düzeyinde JWT Güvenliği**, **IDOR Korumalı Abonelik Yetkilendirmesi** ve **Sohbet İçi Teklif (In-Chat Offer)** akışlarını detaylandırmaktadır.

---

## 1. Mimari Genel Bakış

Platformda kullanıcılar arası anlık mesajlaşma ve bildirim iletimi, geleneksel HTTP polling yerine çift yönlü, düşük gecikmeli **WebSocket + STOMP (Simple Text Oriented Messaging Protocol)** ile sağlanır:

```
[İstemci / React UI]
        │
        ├── 1. HTTP GET /ws (El Sıkışma / CookieHandshakeInterceptor)
        │      └── "sh_at" HttpOnly çerezinden JWT okunur -> session attribute'a yazılır.
        │
        ├── 2. STOMP CONNECT Frame
        │      └── WebSocketSecurityConfig: JWT doğrulanır, SecurityContext / Principal bağlanır.
        │
        ├── 3. STOMP SUBSCRIBE Frame (/topic/chat/{roomId})
        │      └── ChannelInterceptor -> ChatAuthorizationService (Oda üyesi mi? Yetkisizse REDDET).
        │
        └── 4. STOMP SEND Frame (/app/chat.sendMessage)
               └── ChatWebSocketController -> MessageRepository + NotificationService -> /topic/chat/{roomId}
```

---

## 2. El Sıkışma ve Çok Katmanlı Güvenlik Modeli

### A. HttpOnly Çerez El Sıkışması: [`WebSocketConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketConfig.java)
- **Endpoint:** `/ws`
- **CORS / Origin Politikası:** Wildcard (`*`) kesinlikle kullanılmaz. `CorsConfigProperties.allowedOrigins` listesindeki güvenli frontend origin'leri (`http://localhost:5173` vb.) zorunludur.
- **`CookieHandshakeInterceptor`:** Tarayıcı güvenliği gereği JavaScript tarafından okunamayan `sh_at` (Access Token) çerezini HTTP Handshake aşamasında yakalar ve WebSocket oturum özniteliğine (`ws_token`) aktarır.

---

### B. Kanal Düzeyinde Güvenlik ve IDOR Engelleme: [`WebSocketSecurityConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketSecurityConfig.java)

WebSocket protokolünde HTTP filtreleri (Spring Security Filter Chain) yalnızca ilk el sıkışmada devreye girer. El sıkışma sonrasındaki her bir STOMP çerçevesi (frame) için mesaj broker seviyesinde güvenlik `ChannelInterceptor` ile sağlanır:

1. **CONNECT Doğrulaması (`authenticateConnect`):**
   - STOMP başlıklarındaki `Authorization: Bearer <token>` veya el sıkışmadan gelen `ws_token` okunur.
   - `JwtUtils.validateToken()` ile imza, süre ve kara liste denetimi yapılır.
   - Doğrulanmış kullanıcı `UsernamePasswordAuthenticationToken` olarak `accessor.setUser(...)` içine enjekte edilir.
2. **Kimliksiz İstek Koruması:**
   - `CONNECT` haricindeki tüm komutlarda (`SUBSCRIBE`, `SEND`, `UNSUBSCRIBE`) oturum açmış kullanıcı zorunludur. Yetkisiz isteklerde `MessageDeliveryException("WebSocket authentication required")` fırlatılır.
3. **Abonelik IDOR Koruması (`authorizeChatSubscription`):**
   - Bir kullanıcı `/topic/chat/{roomId}` konusuna abone olmak istediğinde, `ChatAuthorizationService.validateRoomParticipant(roomId, userId)` çağrılır.
   - Kullanıcı ilgili sohbet odasının alıcısı veya satıcısı değilse abonelik anında engellenir (`Not a participant of chat room`). Bu sayede kötü niyetli kullanıcıların rastgele oda numaralarını dinlemesi imkansız kılınır.

---

## 3. STOMP Kanal ve Rota Yapısı

| Ön Ek / Rota | Tür | Açıklama |
| :--- | :--- | :--- |
| **`/ws`** | Endpoint | STOMP bağlantı ve el sıkışma noktası. |
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
   - Alıcı doğrudan sohbet penceresinden teklif fiyatı gönderebilir.
   - Sistem arka planda `OfferService` üzerinden teklif kaydı açar ve sohbete özel teklif kartı mesajı (`OFFER`) iliştirir.
   - Satıcı sohbet içerisinden tek tıklamayla teklifi kabul edebilir veya reddedebilir.
2. **Oda Zenginleştirme (`ChatRoomEnricher`):**
   - İstemci oda listesini sorguladığında, her oda için ilişkili ilanın kapak görseli, başlığı, güncel fiyatı, satıcı/alıcı profili ve okunmamış mesaj sayısı tek bir DTO (`ChatRoomDto`) halinde döner.
3. **Okunmamış Mesaj Takibi:**
   - Kullanıcı odayı açtığında `/app/chat.markAsRead` gönderilir; mesajlar veritabanında okundu durumuna getirilir ve karşı tarafa çift mavi tik/okundu durumu iletilir.

---

## 5. Hata Yönetimi ve Dayanıklılık

- **Mesaj Gönderen Eşleme Denetimi:** `ChatWebSocketController` içerisinde gönderilen payload'daki `senderId` ile STOMP oturumundaki `principal.getId()` doğrulanır. Uyuşmazlık durumunda mesaj işlenmez (spoofing engeli).
- **Kopma ve Yeniden Bağlanma (Reconnect):** İstemci tarafı bağlantı koptuğunda exponential backoff ile `/ws` adresine yeniden bağlanır; `sh_at` çerezi geçerli olduğu sürece kullanıcıdan tekrar giriş yapması istenmez.

---

## 6. İlgili Dosyalar

- WebSocket Konfigürasyonu: [`WebSocketConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketConfig.java)
- Kanal Güvenliği: [`WebSocketSecurityConfig.java`](../src/main/java/com/serhat/secondhand/core/config/WebSocketSecurityConfig.java)
- STOMP Controller: [`ChatWebSocketController.java`](../src/main/java/com/serhat/secondhand/chat/controller/ChatWebSocketController.java)
- Yetkilendirme Servisi: [`ChatAuthorizationService.java`](../src/main/java/com/serhat/secondhand/chat/application/ChatAuthorizationService.java)
- REST API: [`ChatRestController.java`](../src/main/java/com/serhat/secondhand/chat/api/ChatRestController.java)
