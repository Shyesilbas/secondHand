# Chat Domain

Provides real-time 1-on-1 buyer-seller messaging (`chat_rooms` and `messages` tables) over REST and STOMP WebSockets (`/ws`, Spring simple broker fanned out across instances through Redis), participant IDOR guards (`ChatAuthorizationService`), and in-chat bargaining offers.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](/docs/websocket-stomp-and-chat-architecture.md) (STOMP handshake, channel interceptor, broadcast)
> - **Moderation & Blocking:** [`docs/chat-moderation-user-blocking-and-messaging-settings.md`](/docs/chat-moderation-user-blocking-and-messaging-settings.md)
> - **Frontend Module:** [`secondhand-frontend/src/chat/README.md`](/secondhand-frontend/src/chat/README.md)
> - **Key Entry Points:** [`ChatRestController`](api/ChatRestController.java) · [`ChatWebSocketController`](controller/ChatWebSocketController.java) · [`ChatService`](application/ChatService.java) · [`ChatAuthorizationService`](application/ChatAuthorizationService.java) · [`ChatNotificationService`](notification/ChatNotificationService.java)

## Business Rules & Invariants
- **Strict Participant Privacy (Zero IDOR):** `ChatAuthorizationService` and `WebSocketSecurityConfig` verify that `currentUser.getId()` is in the room's `participantIds` (`chat_room_participants`) before allowing transcript reads, message sends, or `/topic/chat/{roomId}` STOMP subscriptions (`ChatErrorCodes.ACCESS_DENIED`).
- **Durable Persistence Before Broadcast:** Every message (REST or STOMP `/app/chat.sendMessage`) is persisted to `messages` (`is_read = false`) and refreshes the room's `last_message`, `last_message_time` and `last_message_sender_id` (`ChatRoomUpdater.updateLastMessage`); then `ChatNotificationService` broadcasts it to `/topic/chat/{roomId}`. The STOMP handler drops a message whose `senderId` is not the authenticated user.
- **In-Chat Offer Integration:** `POST /api/v1/chats/rooms/{roomId}/offers` (`SendInChatOfferRequest`) creates an `Offer` in `offers` and attaches `offer_id` to a chat message in the room transcript.

- **Messaging lock:** `ChatService` refuses rooms, messages and in-chat offers when a user block exists (`USER_BLOCKED`), when `listings.can_send_message` is false for a listing room (`CHAT_DISABLED_BY_SELLER`), or when the recipient's `users.can_send_message` is false in a direct room (`CHAT_DISABLED_BY_USER`). Existing rooms lock too; `ChatRoomDto.messagingDisabled` carries the reason to the UI.
- **Per-user room delete (`ChatRoomHide`):** `DELETE /rooms/{roomId}` records `chat_room_hides.hidden_at` for the caller only; the room leaves their list (`ChatRoomRepository.NOT_HIDDEN_FOR_USER`) until a newer message, and their history starts after it. No rows are deleted.
- **Message delete is a tombstone:** `DELETE /messages/{messageId}` sets `messages.deleted_by_sender_at`; text stays for complaints and `ChatTranscriptService`, clients get `deletedBySender` with null content and can still report it.
- **Listing rooms:** named from the stored title (`listingTitle` param ignored); own listing is `CHAT_WITH_SELF`; new rooms need `ListingStatus.isPublicBrowsable()` (`LISTING_NOT_AVAILABLE_FOR_CHAT`).
- **Moderation tombstone:** a penalty on a complaint with `reportedMessageId` sets `messages.removed_by_moderation`; `ChatMessageMapper` then nulls the content for clients while the row keeps its text for appeal review. An approved appeal restores it (`SanctionExecutor`).

## WebSocket & Redis
- STOMP endpoint: `/ws` (SockJS, authenticated on `CONNECT` via a STOMP `Authorization: Bearer` header or the `sh_at` cookie copied at handshake (`WebSocketConfig`, `WebSocketSecurityConfig`)).
- Inbound destinations (`ChatWebSocketController`): `/app/chat.sendMessage` (`ChatMessageDto`), `/app/chat.joinRoom`, `/app/chat.leaveRoom`, `/app/chat.markAsRead`. Outbound: `/topic/chat/{roomId}`. The broker is Spring's simple broker (`WebSocketConfig.enableSimpleBroker`); `ChatNotificationService` sends through `StompFanoutPublisher`, which publishes on the Redis channel `v4:ws:fanout` so every instance (`StompFanoutListener`) delivers to its own clients. If Redis is down the push reaches only local clients and the error is logged.

## API (`ChatRestController`, `/api/v1/chats`)
- `GET /rooms/user` — active conversation rooms for the authenticated user.
- `POST /rooms/direct` & `POST /rooms/listing/{listingId}` — open or get a direct or listing-bound chat room.
- `GET /rooms/{roomId}/messages` & `POST /messages` — paginated message history and REST message send.
- `GET /messages/user` — paginated messages across all rooms of the caller.
- `PUT /rooms/{roomId}/messages/read` & `GET /messages/unread-count` — mark room messages read and get unread badge count.
- `POST /rooms/{roomId}/offers` — submit an in-chat bargaining offer (`SendInChatOfferRequest`).
- `DELETE /rooms/{roomId}` & `DELETE /messages/{messageId}` — hide a room for the caller or tombstone own message.
