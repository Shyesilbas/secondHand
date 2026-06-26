# Chat Domain

## Purpose
The `chat` domain provides real-time user-to-user messaging capabilities using the WebSocket (STOMP) protocol, backed by Redis Pub/Sub for distributed message routing.

## Architecture Overview
- **ChatMessageService:** Persists messages to PostgreSQL and retrieves chat history.
- **WebSocketAuthInterceptor:** Validates JWT tokens during the initial WS connection (CONNECT frame).
- **RedisMessagePublisher / Subscriber:** Routes messages across multiple application instances.

## Business Invariants & Constraints
- **WebSocket Authentication:** HTTP filters are bypassed for WS connections. All auth validation must occur inside the `WebSocketAuthInterceptor`.
- **Durability:** While Redis routes messages, PostgreSQL is the source of truth for message persistence.
- **Session State:** User online/offline status relies on detecting WS CONNECT/DISCONNECT frames.

## Integration Points
- **Incoming:** WS connections from the client.
- **Outgoing:** Push notifications to connected clients.

## Public APIs
- WebSocket STOMP Endpoints mapped via `@MessageMapping`.

## Related Knowledge
- *(No specific runbooks extracted; modifications usually require Redis and WS security knowledge)*
