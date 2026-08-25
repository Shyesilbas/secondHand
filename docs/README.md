# secondHand Sistem Mimari Dokümantasyon Rehberi (`/docs`)

Bu dizin, secondHand platformunun yüksek performanslı, olay güdümlü ve finansal güvenliği garanti altına alan modern backend mimarisinin tüm detaylarını barındırır.

---

## 📚 Doküman Haritası

| Doküman | Kapsam ve Açıklama |
| :--- | :--- |
| **[external-integrations-cloudinary-and-exchange.md](file:///Users/serhat/IdeaProjects/secondHand/docs/external-integrations-cloudinary-and-exchange.md)** | Dış Entegrasyonlar: Cloudinary (Görsel Depolama & CDN) ve ExchangeRate-API (2 Saatlik Redis Önbellekli Döviz Kuru) rehberi. |
| **[payment-strategy-and-provider-extension-guide.md](file:///Users/serhat/IdeaProjects/secondHand/docs/payment-strategy-and-provider-extension-guide.md)** | Ödeme Strateji Deseni (Strategy Pattern), Hexagonal Port & Adapter (`PaymentProviderPort`), Açık/Kapalı Prensibi (OCP) ve Yeni Sağlayıcı Ekleme rehberi. |
| **[auth-jwt-and-security-architecture.md](file:///Users/serhat/IdeaProjects/secondHand/docs/auth-jwt-and-security-architecture.md)** | Stateless JWT & Çift Token Rotasyonu, Google OAuth2 SSO, OWASP Güvenlik Başlıkları, Prod Security Guard, RBAC, IDOR ve Kriptografi rehberi. |
| **[safe-meetup-delivery-and-verification.md](file:///Users/serhat/IdeaProjects/secondHand/docs/safe-meetup-delivery-and-verification.md)** | Güvenli Buluşma (Safe Meetup), SHA-256 OTP & QR Kod doğrulama, Brute-Force kilit (`VERIFICATION_LOCKED`) ve 24 saatlik otomatik tamamlama rehberi. |
| **[order-lifecycle-and-compensation-management.md](file:///Users/serhat/IdeaProjects/secondHand/docs/order-lifecycle-and-compensation-management.md)** | Sipariş Durum Makinesi, Kargo & Güvenli Buluşma (Safe Meetup), Kalem Bazlı İptal/İade Telafi Yönetimi ve Otomasyon Scheduler rehberi. |
| **[offer-system-and-concurrency-locks.md](file:///Users/serhat/IdeaProjects/secondHand/docs/offer-system-and-concurrency-locks.md)** | Teklif (Pazarlık) Durum Makinesi, 24 saatlik Redis alıcı rezervasyon kilidi (`offer:reservation`), karşı teklif zinciri ve eşzamanlılık rehberi. |
| **[multi-tier-redis-caching-and-invalidation.md](file:///Users/serhat/IdeaProjects/secondHand/docs/multi-tier-redis-caching-and-invalidation.md)** | Multi-Tier Polymorphic Redis Önbellekleme (`v4::`), Jackson `@class` serileştirme güvenliği, kademeli TTL ve Invalidation matrisi rehberi. |
| **[escrow-lifecycle-and-state-machine.md](file:///Users/serhat/IdeaProjects/secondHand/docs/escrow-lifecycle-and-state-machine.md)** | Escrow (Güvenli Havuz) Durum Makinesi, 3 günlük otomatik teslimat mutabakatı, Transactional Outbox ve satıcı e-Cüzdan aktarım mimarisi rehberi. |
| **[stock-reservation-and-reconciliation.md](file:///Users/serhat/IdeaProjects/secondHand/docs/stock-reservation-and-reconciliation.md)** | Redis in-memory stok rezervasyonu, 15 dk anti-hoarding TTL, PostgreSQL veri mutabakatı (Reconciliation) ve otomatik drift onarım (Auto-Healing) rehberi. |
| **[redis-and-kafka-architecture.md](file:///Users/serhat/IdeaProjects/secondHand/docs/redis-and-kafka-architecture.md)** | Redis (Multi-Tier Caching, Lua Scripting, Idempotency) ve Apache Kafka (Transactional Outbox, Consumer Idempotency, Topics) uçtan uca mimari raporu. |
| **[new-payment-system.md](file:///Users/serhat/IdeaProjects/secondHand/docs/new-payment-system.md)** | Ödeme, Stok, Escrow, Kupon, Teklif ve Vitrin sistemlerinin uçtan uca mimari tasarımı, Redis Lua scriptleri, Transactional Outbox Pattern ve Apache Kafka entegrasyon prensipleri. |
| **[social-proof-and-urgency-metrics-architecture.md](file:///Users/serhat/IdeaProjects/secondHand/docs/social-proof-and-urgency-metrics-architecture.md)** | Sosyal Kanıt & Canlı İlgi Mimarisi: 24 saatlik Redis ZSET tekil inceleme penceresi, 15 dk checkout stok tutma (sayfa yenileme korumalı), 12 saatlik favori önbelleği ve frontend anti-polling kuralları rehberi. |
| **[concurrency-test-report.md](file:///Users/serhat/IdeaProjects/secondHand/docs/concurrency-test-report.md)** | 4 kritik entegrasyon testinin (`ConcurrentStockAndPaymentIntegrationTest`) canlı test sonuçları, milisaniyelik log analizleri ve performans metrikleri. |

---

## 🏗️ Temel Mimari Prensipler Özeti

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
