# ADR-0005: Oturum token'ları HttpOnly cookie'de

- **Durum:** Kabul edildi
- **Kapsam:** `auth`, `core/jwt`, `core/security`, frontend

## Bağlam
Token'ın `localStorage`'da tutulması XSS ile çalınmasına açıktır. Uygulama aynı zamanda WebSocket (STOMP) handshake'inde de kimlik doğrulamak zorundadır.

## Karar
Access token (`sh_at`, 15 dk, stateless JWT) ve refresh token (`sh_rt`, 7 gün; remember-me ile 30 gün) `HttpOnly`, `SameSite` cookie olarak taşınır. Refresh token DB'de yalnızca **SHA-256 hash'i** olarak saklanır ve her yenilemede rotation uygulanır. API client'ları için `Authorization: Bearer` da kabul edilir. Frontend token'a hiç dokunmaz; Axios 401'de sessiz refresh yapar.

## Sonuçlar
- Kazanç: JavaScript token'ı okuyamaz; çalınan DB yedeğinden refresh token geri çıkarılamaz.
- Maliyet: Cookie tabanlı oturum CSRF ve CORS yapılandırmasını kritik yapar. `ProdSecurityGuard` prod'da `cookie.secure=true`, boş olmayan `same-site` ve localhost içermeyen CORS origin'lerini zorunlu kılar; aksi halde uygulama başlamaz.
- Kural: Session token'ı asla `localStorage`'a yazılmaz.

## Kod Referansları
[auth-jwt-and-security-architecture.md](../auth-jwt-and-security-architecture.md) · [websocket-stomp-and-chat-architecture.md](../websocket-stomp-and-chat-architecture.md) · [ci-cd-and-deployment-guide.md](../ci-cd-and-deployment-guide.md) · `TokenService` · `ProdSecurityGuard`
