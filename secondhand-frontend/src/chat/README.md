# Chat & Real-Time Messaging UI Module

Direct user-to-user messaging, chat room management, in-chat offer cards, and STOMP WebSocket communication.

## Architecture

- **`useChat`:** Manages active chat room state, infinite room pagination (`GET /v1/chats/rooms/user?page&size`), historical message pagination (`/v1/chats/rooms/{id}/messages`), STOMP message broadcasting (`/app/chat.sendMessage`), and room subscriptions (`/topic/chat/{roomId}`).
- **`useWebSocket`:** Centralized STOMP client over WebSocket (`WS_BASE_URL`). Subscribes to user private queues (`/user/{userId}/queue/messages`) and active room topics (`/topic/chat/{roomId}`), dispatches room presence (`/app/chat.joinRoom`, `/app/chat.leaveRoom`), and manages reconnect backoff up to 10 attempts.
- **`useUnreadCount`:** Tracks unread message counts for navigation bar badges, updating via WebSocket events and React Query query invalidation.
- **`InChatOfferCard`:** Renders contextual offer status and negotiation action buttons (Accept/Reject/Counter) directly inside the message timeline.
- **`InboxPage` Integration:** All chat interactions live inside the unified `InboxPage` under `?tab=chat`. Legacy `/chat` routes automatically redirect to `/inbox?tab=chat&room={id}`.

## Invariants

- **Dual-Channel Delivery:** Real-time messages are dispatched over STOMP (`/app/chat.sendMessage`) when connected; REST endpoints (`chatService.sendMessage`) provide fallback and room creation capabilities.
- **Room Membership:** Users can only view or subscribe to chat rooms where they are an authenticated participant (buyer or seller).
- **Mark As Read:** Opening or switching to a chat room triggers `chatService.markMessagesAsRead(chatRoomId)`, immediately invalidating `['unreadCount']` and room queries.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean message bubbles, no animated bouncing dots or neon colors, subtle timestamp indicators, and hairline dividers.
