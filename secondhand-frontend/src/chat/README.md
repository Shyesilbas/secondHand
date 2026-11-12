# Chat & Real-Time Messaging UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`chat`](../../../src/main/java/com/serhat/secondhand/chat/README.md)
> - **Architecture Deep Dive:** [`docs/websocket-stomp-and-chat-architecture.md`](../../../docs/websocket-stomp-and-chat-architecture.md)

## 1. Executive Summary & Route Map
The `chat` module provides direct, real-time messaging between marketplace buyers and sellers. It integrates WebSocket STOMP communications, room list synchronization, unread message badges, in-chat price bargaining (`InChatOfferCard`), and reporting shortcuts.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/inbox?tab=chat` | `InboxPage` / `ChatPage` | `Protected` | Yes | Unified messaging portal with room sidebar and active window |
| `/chat` (legacy) | Redirect -> `/inbox?tab=chat` | `Protected` | Yes | Backward compatibility route redirect |

---

## 2. Component Hierarchy & File Structure

```
src/chat/
├── pages/
│   └── ChatPage.jsx                    # Standalone and tabbed chat container
├── components/
│   ├── ChatList.jsx                    # Conversations sidebar with unread indicators
│   ├── ChatRoomListItem.jsx            # Individual room card with avatar, last message, timestamp
│   ├── ChatWindow.jsx                  # Active room view, header, timeline, and input box
│   ├── ChatHeader.jsx                  # Participant metadata, listing context pill, report trigger
│   ├── MessageList.jsx                 # Virtualized message bubble list with date dividers
│   ├── ChatInput.jsx                   # Expanding textarea, submit button, keyboard shortcuts (Enter)
│   ├── InChatOfferCard.jsx             # Embedded offer card with Accept/Reject/Counter actions
│   └── ContactSellerButton.jsx         # Contextual trigger on listing detail to initiate room
├── hooks/
│   ├── useChat.js                      # Core STOMP WebSocket client, room subscription, send handler
│   ├── useChatWindow.js                # Active window scrolling, read receipt observer
│   └── useUnreadCount.js               # Tracks total unread messages for navbar notification badge
├── services/
│   └── chatService.js                  # Raw Axios endpoints (/api/v1/chats/**)
├── chatIdUtils.js                      # Helper resolving room IDs and counterparty user IDs
├── chatConstants.js                    # STOMP destination paths, reconnect limits, message types
└── README.md                           # Module documentation
```

---

## 3. Real-Time WebSocket & React Query Data Flow

### 3.1 STOMP WebSocket Protocol
- **Broker Endpoint:** Connected via `@stomp/stompjs` using HttpOnly session cookies.
- **Outbound Message Send:** Published to `/app/chat.sendMessage`.
- **Inbound Room Subscription:** Subscribed to `/topic/chat/{roomId}`.
- **User Destination Queue:** Subscribed to `/user/queue/messages` for incoming alerts while outside the active room.
- **Presence & Read Signals:** Dispatches `/app/chat.joinRoom` and `/app/chat.leaveRoom`.

### 3.2 Query Key Topology & Invalidation
- `['chatRooms']`: List of user's active conversations.
- `['chatMessages', roomId]`: Chronological messages for a room.
- `['unreadChatCount']`: Total unread message badge count.

| Trigger / Mutation | Invalidated Query Keys | UX Impact |
|---|---|---|
| Open Room / Mark as Read | `['unreadChatCount']`, `['chatRooms']` | Clears unread badge on conversation card |
| In-Chat Offer Action | `['offers']`, `['chatMessages', roomId]` | Updates offer card state to Accepted/Rejected |
| Inbound Message Arrives | `['chatRooms']` | Moves conversation to top of sidebar |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Conversations sidebar renders 5 skeleton rows mimicking room previews.
   - Message timeline displays alternating left/right skeleton message bubbles.
2. **Empty State:**
   - Room list empty: Displays an empty state with a message icon: "No conversations yet."
   - Active window without room: "Select a conversation from the left to start messaging."
3. **Error State:**
   - Connection drops show a subtle reconnecting alert banner at the top of the chat window.
4. **Disabled / Submitting State:**
   - Submit button is disabled when input is empty or whitespace-only.
   - Disabled while reconnection is in flight.

---

## 5. In-Chat Offer Negotiation Flow (`InChatOfferCard`)
- When a buyer makes an offer from a listing or directly in chat, an `InChatOfferCard` renders in the message stream.
- The seller can directly click "Accept", "Reject", or "Counter" without leaving the chat thread.
- Acceptance locks the listing for 24 hours and provides a direct "Proceed to Checkout" button for the buyer.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions parsed via `errorUtils.getErrorMessage(err)`:
  - `CHAT_NOT_PARTICIPANT` -> "You are not authorized to view or post in this chat room."
  - `CHAT_MESSAGE_TOO_LONG` -> "Messages are limited to 2,000 characters."
  - `RECIPIENT_BANNED` -> "This user is restricted from receiving new messages."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Message Bubbles:** Subtle neutral styling (`bg-surface-secondary text-content-primary` for incoming, `bg-primary text-white` for outgoing).
- **Typography:** Timestamps use `font-mono tabular-nums text-xs text-text-muted`.
- **Zero Emojis:** Strictly prohibited across system messages, presence tags, and in-chat offer action buttons.
- **Radius Ceiling:** Message bubbles, inputs, and offer cards adhere strictly to `rounded-md`.
