# Chat Domain

Provides real-time 1-on-1 buyer-seller messaging (`chat_rooms` and `messages` tables) over REST and STOMP WebSockets (`/ws`), cross-instance Redis Pub/Sub routing, participant IDOR guards (`ChatAuthorizationService`), and in-chat bargaining offers.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](/docs/websocket-stomp-and-chat-architecture.md) (STOMP handshake, channel interceptor, Redis Pub/Sub broadcast)
> - **Frontend Module:** [`secondhand-frontend/src/chat/README.md`](/secondhand-frontend/src/chat/README.md)
> - **Key Entry Points:** [`ChatRestController`](api/ChatRestController.java) · [`ChatWebSocketController`](controller/ChatWebSocketController.java) · [`ChatService`](application/ChatService.java) · [`ChatAuthorizationService`](application/ChatAuthorizationService.java) · [`ChatNotificationService`](notification/ChatNotificationService.java)

## Business Rules & Invariants
- **Strict Participant Privacy (Zero IDOR):** `ChatAuthorizationService` and `WebSocketSecurityConfig` verify that `currentUser.getId()` is either `room.user1.id` or `room.user2.id` before allowing transcript reads, message sends, or `/topic/room.{roomId}` STOMP subscriptions (`CHAT_NOT_PARTICIPANT` / `ACCESS_DENIED`).
- **Durable Persistence Before Broadcast:** Every message (REST or STOMP `/app/chat.send`) is persisted to `messages` (`is_read = false`) and updates `chat_rooms.last_message_at` before broadcasting over Redis Pub/Sub and STOMP (`/topic/room.{roomId}`, `/user/queue/messages`) and triggering `ChatNotificationService`.
- **In-Chat Offer Integration:** `POST /api/v1/chats/rooms/{roomId}/offers` (`SendInChatOfferRequest`) creates an `Offer` in `offers` and attaches `offer_id` to a chat message in the room transcript.

## WebSocket & Redis
- STOMP endpoint: `/ws` (SockJS, authenticated on `CONNECT` via `access_token` cookie or Bearer JWT in `WebSocketSecurityConfig`).
- Inbound destination: `/app/chat.send` (`ChatMessageDto`). Outbound: `/topic/room.{roomId}` and `/user/queue/messages` (backed by Redis Pub/Sub).

## API (`ChatRestController`, `/api/v1/chats`)
- `GET /rooms/user` — active conversation rooms for the authenticated user.
- `POST /rooms/direct` & `POST /rooms/listing/{listingId}` — open or get a direct or listing-bound chat room.
- `GET /rooms/{roomId}/messages` & `POST /messages` — paginated message history and REST message send.
- `PUT /rooms/{roomId}/messages/read` & `GET /messages/unread-count` — mark room messages read and get unread badge count.
- `POST /rooms/{roomId}/offers` — submit an in-chat bargaining offer (`SendInChatOfferRequest`).
- `DELETE /rooms/{roomId}` & `DELETE /messages/{messageId}` — soft-close a room or delete a message.
