# Chat Domain

## Purpose
The `chat` domain provides real-time user-to-user messaging capabilities using both the WebSocket (STOMP) protocol and comprehensive REST endpoints, backed by Redis Pub/Sub for distributed message routing and PostgreSQL for durable conversation persistence.

## Architecture Overview
- **ChatMessageService & ChatRoomService:** Manages room lifecycles, message persistence, offer attachments, and conversation history.
- **WebSocketSecurityConfig (channel interceptor):** Validates JWT tokens during the initial WS connection (CONNECT frame).
- **RedisMessagePublisher / Subscriber:** Routes messages across multiple application instances via Redis Pub/Sub.
- **ChatRestController & ChatWebSocketController:** Dual-channel communication support (REST and STOMP).

## Business Invariants & Constraints
- **WebSocket Authentication:** HTTP filters are bypassed for WS connections. All auth validation must occur inside the `WebSocketSecurityConfig (channel interceptor)`.
- **Durability:** While Redis routes real-time events across nodes, PostgreSQL remains the immutable source of truth for message and room persistence.
- **Listing & Direct Chats:** Rooms can be tied directly to a specific listing or opened as user-to-user direct inquiries.
- **In-Chat Offers:** Buyers and sellers can link formal offers to active chat conversations (`POST /api/v1/chats/rooms/{chat-room-id}/offers`).

## Integration Points
- **Incoming:** WS STOMP connections and HTTP REST requests from clients.
- **Outgoing:** Dispatches real-time STOMP frames and push notifications to connected clients.

## Public APIs
- **REST Endpoints (`/api/v1/chats`):**
  - `GET /api/v1/chats/rooms/user`: Lists active chat rooms for current user.
  - `POST /api/v1/chats/rooms/direct`: Opens or retrieves a direct conversation room with a user.
  - `POST /api/v1/chats/rooms/listing/{listing-id}`: Opens or retrieves a conversation room for a listing.
  - `POST /api/v1/chats/messages`: Sends a text message via REST.
  - `POST /api/v1/chats/rooms/{chat-room-id}/offers`: Submits an offer directly inside a chat room.
  - `GET /api/v1/chats/rooms/{chat-room-id}/messages`: Paginated message history for a chat room.
  - `PUT /api/v1/chats/rooms/{chat-room-id}/messages/read`: Marks messages in a chat room as read.
  - `GET /api/v1/chats/messages/user`: Paginated message feed for the user.
  - `GET /api/v1/chats/messages/unread-count`: Total count of unread chat messages.
  - `DELETE /api/v1/chats/rooms/{chat-room-id}`: Deletes or closes a chat room.
  - `DELETE /api/v1/chats/messages/{message-id}`: Deletes a specific message.
- **WebSocket (STOMP):**
  - Application Destination: `/app/chat.send`
  - Subscriptions: `/user/queue/messages`, `/topic/room.{roomId}`
