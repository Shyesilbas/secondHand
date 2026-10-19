# Chat & Real-Time Messaging UI Module

Direct user-to-user messaging, chat room management, in-chat offer cards, and STOMP WebSocket communication.

## Architecture
- `useChat`: Manages active chat room state, historical message pagination, STOMP message sending (`/app/chat.sendMessage`), and room subscriptions (`/topic/chat/{roomId}`).
- `useUnreadCount`: Tracks aggregated unread message counts for navigation bar badges.
- `InChatOfferCard`: Renders contextual offer status and action buttons (Accept/Reject) directly inside the message timeline.
- `ChatRoomListItem`: Presents room summary with attached listing snippet, latest message preview, and unread dot indicator.

## Invariants
- **Room Membership:** Users can only view or subscribe to chat rooms where they are the buyer or seller.
- **Optimistic Timestamps:** Outgoing messages appear immediately with a pending indicator and transition to confirmed once acknowledged by the broker.
- **Mark As Read:** Entering a room triggers a mark-as-read mutation, decrementing badge counts immediately via React Query invalidation.
