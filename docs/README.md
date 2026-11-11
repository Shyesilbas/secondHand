# secondHand Mimari Dokümantasyonu (`/docs`)

Bu dizin, modül README'lerinin ötesine geçen, birden fazla modülü kesen mimari konuları anlatır. Modül iş kuralları `src/main/java/com/serhat/secondhand/<module>/README.md` içindedir.

---

## Doküman Haritası

### Para akışı
| Doküman | Kapsam |
| :--- | :--- |
| **[payment-strategy-and-provider-extension-guide.md](payment-strategy-and-provider-extension-guide.md)** | Payment Strategy Pattern, Hexagonal Port & Adapter (`PaymentProviderPort`), Open/Closed prensibi ve yeni provider ekleme. |
| **[pricing-coupon-and-campaign-architecture.md](pricing-coupon-and-campaign-architecture.md)** | `PriceCalculationEngine` hesaplama sırası, satıcı kampanyaları, kupon tipleri ve audience'ları, Redis Lua kupon limiti ve redemption. |
| **[order-lifecycle-and-compensation-management.md](order-lifecycle-and-compensation-management.md)** | Sipariş state machine'i, kargo ve Safe Meetup, kalem bazlı iptal/iade compensation ve otomasyon scheduler'ları. |
| **[escrow-lifecycle-and-state-machine.md](escrow-lifecycle-and-state-machine.md)** | Escrow state machine'i, 72 saatlik otomatik tamamlama, Transactional Outbox ve satıcı eWallet aktarımı. |
| **[safe-meetup-delivery-and-verification.md](safe-meetup-delivery-and-verification.md)** | Safe Meetup, SHA-256 OTP & QR doğrulama, brute-force kilidi (`VERIFICATION_LOCKED`) ve 24 saatlik otomatik tamamlama. |
| **[offer-system-and-concurrency-locks.md](offer-system-and-concurrency-locks.md)** | Teklif (pazarlık) state machine'i, 24 saatlik Redis alıcı kilidi (`v4:offer:lock:{listingId}`), counter-offer zinciri ve eşzamanlılık. |

### Stok, Redis ve Kafka
| Doküman | Kapsam |
| :--- | :--- |
| **[redis-and-kafka-architecture.md](redis-and-kafka-architecture.md)** | Redis (cache, Lua script'leri, idempotency, rate limiting) ve Kafka (Transactional Outbox, consumer idempotency, topic'ler, DLT). |
| **[stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md)** | Redis in-memory stok rezervasyonu, 15 dk anti-hoarding TTL, PostgreSQL reconciliation ve drift auto-healing. |
| **[multi-tier-redis-caching-and-invalidation.md](multi-tier-redis-caching-and-invalidation.md)** | Multi-tier Redis cache (`v4:`), Jackson `@class` serialization güvenliği, cache bazında TTL ve invalidation matrisi. |
| **[social-proof-and-urgency-metrics-architecture.md](social-proof-and-urgency-metrics-architecture.md)** | 24 saatlik Redis ZSET tekil görüntüleme penceresi, 15 dk checkout stok tutma, 12 saatlik favori cache'i ve frontend anti-polling kuralları. |
| **[rate-limiting-and-throttling-architecture.md](rate-limiting-and-throttling-architecture.md)** | Çok katmanlı hız sınırlama: Dağıtık Redis Lua fixed-window (`RateLimitingFilter`), IP sahtecilik koruması (`ClientIpResolver`), iki aşamalı login throttling (`LoginAttemptService`) ve domain kilitleri. |

### Kimlik, iletişim ve AI
| Doküman | Kapsam |
| :--- | :--- |
| **[auth-jwt-and-security-architecture.md](auth-jwt-and-security-architecture.md)** | Stateless JWT ve refresh token rotation, Google OAuth2 SSO, OWASP security header'ları, Prod Security Guard, RBAC, IDOR ve kriptografi. |
| **[websocket-stomp-and-chat-architecture.md](websocket-stomp-and-chat-architecture.md)** | Spring WebSocket + STOMP, HttpOnly cookie handshake, channel seviyesinde JWT, IDOR korumalı room subscription ve sohbet içi teklif. |
| **[notification-feed-and-broadcast-architecture.md](notification-feed-and-broadcast-architecture.md)** | Kişisel bildirimler, sistem broadcast'leri, unified feed projection (`NotificationFeedRepository`), WebSocket live push ve badge cache eviction. |
| **[email-architecture-and-event-driven-dispatch.md](email-architecture-and-event-driven-dispatch.md)** | Event-driven e-posta gönderimi: `mail.dispatch.v1`, `EmailKafkaProducer`/`EmailKafkaConsumer`, template'ler ve idempotency. |
| **[aura-ai-and-context-architecture.md](aura-ai-and-context-architecture.md)** | Aura AI asistanı: Gemini entegrasyonu, SSE streaming, context adapter'ları, otonom arama planlaması (`AuraListingSearchOrchestrator`), kullanıcı belleği ve güvenlik sınırları. |
| **[aura-trust-safety-and-complaint-moderation-architecture.md](aura-trust-safety-and-complaint-moderation-architecture.md)** | Aura AI güven ve moderasyon motoru: 2 saatlik soğuma süresi, Redis ZSET gecikmeli kuyruğu, saatlik 10 batch worker'ı, sohbet/ilan analizi ve kademeli ceza merdiveni. |
| **[external-integrations-cloudinary-and-exchange.md](external-integrations-cloudinary-and-exchange.md)** | Cloudinary (görsel depolama & CDN) ve ExchangeRate-API (2 saatlik Redis cache'li döviz kuru). |

### Katalog, veri ve altyapı
| Doküman | Kapsam |
| :--- | :--- |
| **[catalog-and-category-polymorphism.md](catalog-and-category-polymorphism.md)** | 6 vertical'da JPA polymorphism, `AbstractListingService` (Template Method), `ListingValidationEngine`, 317 dosyalık JSON katalog verisi ve kategoriye özel katalog kurallarına linkler. |
| **[database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md)** | Flyway versiyonlama ve DDL kuralları, `--app.seed` key'leri, upsert + prune yaşam döngüsü. |
| **[ci-cd-and-deployment-guide.md](ci-cd-and-deployment-guide.md)** | Docker Compose servisleri (Postgres, Redis, Kafka KRaft), environment variable'lar (`.env`), Prod Security Guard ve Actuator/Prometheus. |
| **[error-handling-and-contract-architecture.md](error-handling-and-contract-architecture.md)** | Dual-track hata modeli (`ProblemDetail` + `ResultResponses`), HTTP durum haritalaması (`ErrorCodeStatuses`), frontend güvenli hata çözme (`errorUtils`) ve Axios katmanı. |

---

## Temel Mimari Prensipler

Ayrıntılar ve kod referansları [redis-and-kafka-architecture.md](redis-and-kafka-architecture.md) içindedir.

1. **Atomik Redis Lua script'leri:** Stok rezervasyonu ve reconciliation, kupon limiti ve rate limiting; satır kilidi beklemeden tek atomik çağrı.
2. **Transactional Outbox:** `payment_outbox_events`, `order_outbox_events`, `escrow_outbox_events`; event ana kayıtla aynı transaction'da yazılır, worker'lar Kafka'ya at-least-once gönderir.
3. **Event-driven yan etkiler (Kafka):** `payment.completed.v1`, `escrow.released.v1`, `mail.dispatch.v1` topic'lerini dinleyen consumer'lar `processed_kafka_events` ile tekrar eden mesajları atlar.
4. **TTL'li Redis kilitleri:** Kabul edilen teklifin 24 saatlik alıcı kilidi (`v4:offer:lock:{listingId}`) ve aktif vitrin süresi (`v4:listing:showcase:active:{listingId}`); süresi dolan veri için scheduler taraması gerekmez.
