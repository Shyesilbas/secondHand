# Chat & Real-Time Messaging UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`chat`](../../../src/main/java/com/serhat/secondhand/chat/README.md)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](../../../docs/websocket-stomp-and-chat-architecture.md)

## 1. Executive Summary & Route Map

- `/chat` redirects to `/inbox?tab=chat` (`AppRoutes.jsx`); the UI renders inside `InboxPage`.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['chatMessages', user?.id, selectedChatRoom?.id]` | `useChat.js` |
| `['chatRooms', user?.id]` | `useChat.js` |

| Invalidated / updated key | By |
|---|---|
| `UNREAD_COUNT_KEYS.room(chatRoomId, user?.id)` | `useChat.js` |
| `UNREAD_COUNT_KEYS.total(user?.id)` | `useChat.js` |
| `['chatMessages', message.chatRoomId]` | `InChatOfferCard.jsx` |
| `['chatMessages', user?.id, selectedChatRoom?.id]` | `useChat.js` |
| `['chatRooms', user?.id]` | `useChat.js` |
| `['offers']` | `InChatOfferCard.jsx` |

## 3. Real-Time WebSocket

### STOMP WebSocket Protocol
- **Broker Endpoint:** Connected via `@stomp/stompjs` using HttpOnly session cookies.
- **Outbound Message Send:** Published to `/app/chat.sendMessage`.
- **Inbound Room Subscription:** Subscribed to `/topic/chat/{roomId}`.
- **User Destination Queue:** Subscribed to `/user/queue/messages` for incoming alerts while outside the active room.
- **Presence & Read Signals:** Dispatches `/app/chat.joinRoom` and `/app/chat.leaveRoom`.

## 4. In-Chat Offer Negotiation Flow (`InChatOfferCard`)
- When a buyer makes an offer from a listing or directly in chat, an `InChatOfferCard` renders in the message stream.
- The seller can directly click "Accept", "Reject", or "Counter" without leaving the chat thread.
- Acceptance locks the listing for 24 hours and provides a direct "Proceed to Checkout" button for the buyer.
