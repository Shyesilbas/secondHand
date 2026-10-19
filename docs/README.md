# secondHand Sistem Mimari Dokümantasyon Rehberi (`/docs`)

Bu dizin, secondHand platformunun yüksek performanslı, olay güdümlü ve finansal güvenliği garanti altına alan modern backend mimarisinin tüm detaylarını barındırır.

---

## Doküman Haritası

| Doküman | Kapsam ve Açıklama |
| :--- | :--- |
| **[external-integrations-cloudinary-and-exchange.md](external-integrations-cloudinary-and-exchange.md)** | Dış Entegrasyonlar: Cloudinary (Görsel Depolama & CDN) ve ExchangeRate-API (2 Saatlik Redis Önbellekli Döviz Kuru) rehberi. |
| **[payment-strategy-and-provider-extension-guide.md](payment-strategy-and-provider-extension-guide.md)** | Ödeme Strateji Deseni (Strategy Pattern), Hexagonal Port & Adapter (`PaymentProviderPort`), Açık/Kapalı Prensibi (OCP) ve Yeni Sağlayıcı Ekleme rehberi. |
| **[auth-jwt-and-security-architecture.md](auth-jwt-and-security-architecture.md)** | Stateless JWT & Çift Token Rotasyonu, Google OAuth2 SSO, OWASP Güvenlik Başlıkları, Prod Security Guard, RBAC, IDOR ve Kriptografi rehberi. |
| **[safe-meetup-delivery-and-verification.md](safe-meetup-delivery-and-verification.md)** | Güvenli Buluşma (Safe Meetup), SHA-256 OTP & QR Kod doğrulama, Brute-Force kilit (`VERIFICATION_LOCKED`) ve 24 saatlik otomatik tamamlama rehberi. |
| **[order-lifecycle-and-compensation-management.md](order-lifecycle-and-compensation-management.md)** | Sipariş Durum Makinesi, Kargo & Güvenli Buluşma (Safe Meetup), Kalem Bazlı İptal/İade Telafi Yönetimi ve Otomasyon Scheduler rehberi. |
| **[offer-system-and-concurrency-locks.md](offer-system-and-concurrency-locks.md)** | Teklif (Pazarlık) Durum Makinesi, 24 saatlik Redis alıcı rezervasyon kilidi (`offer:reservation`), karşı teklif zinciri ve eşzamanlılık rehberi. |
| **[multi-tier-redis-caching-and-invalidation.md](multi-tier-redis-caching-and-invalidation.md)** | Multi-Tier Polymorphic Redis Önbellekleme (`v4::`), Jackson `@class` serileştirme güvenliği, kademeli TTL ve Invalidation matrisi rehberi. |
| **[escrow-lifecycle-and-state-machine.md](escrow-lifecycle-and-state-machine.md)** | Escrow (Güvenli Havuz) Durum Makinesi, 3 günlük otomatik teslimat mutabakatı, Transactional Outbox ve satıcı e-Cüzdan aktarım mimarisi rehberi. |
| **[stock-reservation-and-reconciliation.md](stock-reservation-and-reconciliation.md)** | Redis in-memory stok rezervasyonu, 15 dk anti-hoarding TTL, PostgreSQL veri mutabakatı (Reconciliation) ve otomatik drift onarım (Auto-Healing) rehberi. |
| **[redis-and-kafka-architecture.md](redis-and-kafka-architecture.md)** | Redis (Multi-Tier Caching, Lua Scripting, Idempotency) ve Apache Kafka (Transactional Outbox, Consumer Idempotency, Topics) uçtan uca mimari raporu. |
| **[social-proof-and-urgency-metrics-architecture.md](social-proof-and-urgency-metrics-architecture.md)** | Sosyal Kanıt & Canlı İlgi Mimarisi: 24 saatlik Redis ZSET tekil inceleme penceresi, 15 dk checkout stok tutma (sayfa yenileme korumalı), 12 saatlik favori önbelleği ve frontend anti-polling kuralları rehberi. |
| **[aura-ai-and-context-architecture.md](aura-ai-and-context-architecture.md)** | Aura AI Asistanı: Gemini entegrasyonu, SSE streaming, Context Adapters, otonom arama planlaması (`AuraListingSearchOrchestrator`), kullanıcı uzun vadeli belleği ve güvenlik sınırları rehberi. |
| **[websocket-stomp-and-chat-architecture.md](websocket-stomp-and-chat-architecture.md)** | Gerçek Zamanlı Mesajlaşma: Spring WebSocket, STOMP protokolü, HttpOnly çerez el sıkışması, kanal düzeyinde JWT güvenliği, IDOR korumalı oda aboneliği ve sohbet içi teklif rehberi. |
| **[notification-feed-and-broadcast-architecture.md](notification-feed-and-broadcast-architecture.md)** | Bildirim Olay Dağıtımı: Kişisel bildirimler, toplu sistem yayınları (broadcast), birleşik akış projeksiyonu (`NotificationFeedRepository`), WebSocket canlı push iletimi ve rozet önbellek tahliyesi rehberi. |
| **[catalog-and-category-polymorphism.md](catalog-and-category-polymorphism.md)** | Kategori Polimorfizmi & Katalog: 6 ana dikeyde JPA polimorfizmi, 189 JSON veri seti tohumlama hattı, `AbstractListingService` (Template Method), `ListingValidationEngine` ve hiyerarşik önbellekleme rehberi. |
| **[database-migration-and-seeding-guide.md](database-migration-and-seeding-guide.md)** | Veritabanı Migrasyon & Tohumlama: Flyway versiyonlama standartları, DDL kuralları ve JSON katalog verilerinin upsert yaşam döngüsü rehberi. |
| **[ci-cd-and-deployment-guide.md](ci-cd-and-deployment-guide.md)** | CI/CD, Dağıtım & Altyapı: Docker Compose servisleri (Postgres, Redis, Kafka KRaft), ortam değişkenleri (`.env`), Prod Security Guard ve Actuator/Prometheus rehberi. |
| **[concurrency-test-report.md](concurrency-test-report.md)** | 4 kritik entegrasyon testinin (`ConcurrentStockAndPaymentIntegrationTest`) canlı test sonuçları, milisaniyelik log analizleri ve performans metrikleri. |

---

## Temel Mimari Prensipler Özeti

1. **In-Memory Atomic Operations (Redis 7 Lua Scripting):**
   * *Nerede kullanılır?* Stok rezervasyonu (`reserve_stock_with_ttl.lua`), kupon kota kontrolü (`apply_coupon_with_limit.lua`), terk edilen sepet iadesi (`cancel_user_reservation.lua`).
   * *Neden?* PostgreSQL'de `SELECT ... FOR UPDATE` kilit maliyetini sıfırlamak ve yanıt süresini ~20 milisaniyeye düşürmek için.

2. **Transactional Outbox Pattern (Dual-Write Koruması):**
   * *Nerede kullanılır?* Ödeme tamamlama (`payment_outbox_events`), Escrow güvence havuzu çözümü (`escrow_outbox_events`).
   * *Neden?* Veritabanına yazarken aynı anda Kafka'ya atılan mesajların ağ/sunucu kesintilerinde kaybolmasını önlemek, PostgreSQL ACID garantisiyle At-Least-Once teslimat sağlamak için.

3. **Event-Driven Architecture (Apache Kafka):**
   * *Topic'ler:* `payment.completed.v1`, `escrow.released.v1`.
   * *Consumer'lar:* `InventoryKafkaConsumer` (fiziksel DB stok düşümü), `EscrowKafkaConsumer` (satıcı cüzdanına asenkron bakiye yükleme).
   * *Neden?* HTTP isteklerini uzatmadan arka plan yan etkilerini asenkron, ölçeklenebilir ve bağımsız işlemek için.

4. **Dedicated TTL Locks (Teklif & Vitrin):**
   * *Nerede kullanılır?* Kabul edilen tekliflerin 24 saatlik alıcı rezervasyonu (`offer:reservation:{listingId}`), aktif vitrin süreleri (`showcase:active:{listingId}`).
   * *Neden?* Zaman aşımı olan veriler için veritabanını her dakika tarayan ağır scheduler sorgularını ortadan kaldırmak için.
