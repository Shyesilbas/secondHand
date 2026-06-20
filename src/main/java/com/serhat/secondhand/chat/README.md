# Chat Paketi Teknik Rehber

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## 1) Paket Amacı ve Sınırları
`chat` paketi, platform üzerindeki kullanıcılar arası gerçek zamanlı (real-time) mesajlaşma sisteminden sorumludur. WebSocket (STOMP) protokolü üzerinden çalışır.

Kapsam:
- Özel sohbet odaları oluşturma
- Anlık mesaj iletimi ve okundu/okunmadı durumları (Read/Unread)
- Çevrimiçi/çevrimdışı (Online/Offline) kullanıcı durumu takibi
- Redis tabanlı Pub/Sub mekaniği ile dağıtık (distributed) mesaj iletimi

## 2) Kritik Sınıflar
- `ChatController`: STOMP mesajlaşma endpoint'leri (`@MessageMapping`).
- `ChatMessageService`: Mesajların veritabanına (Postgres) kaydedilmesi ve geçmişin getirilmesi.
- `WebSocketAuthInterceptor`: Bağlantı anında (CONNECT frame) gönderilen JWT token'ı parse edip kullanıcı kimliğini doğrulayan güvenlik katmanı.
- `RedisMessagePublisher / Subscriber`: Mesajların farklı sunucu instanceları arasında dağıtılması için kullanılan mekanizma.

## 3) Dikkat Edilmesi Gereken Riskler
- **WebSocket Güvenliği:** HTTP tarafındaki `AuthenticationFilter` WS tarafında çalışmaz. JWT doğrulaması mutlaka `WebSocketAuthInterceptor` üzerinden `ChannelInterceptor` ile yapılmalıdır.
- **Cache ve Pub/Sub:** Redis çökmesi durumunda mesajların kaybolmaması için kalıcı veritabanı (Postgres) kaydının asenkron değil sekron yapılması veya güçlü bir dead-letter-queue mekanizması kurulması gerekir.
- **Session Leak:** Bağlantısı kopan kullanıcıların (DISCONNECT frame) Redis üzerindeki "online" statülerinin anında temizlendiğinden emin olunmalıdır.
