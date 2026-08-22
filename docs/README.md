# secondHand Sistem Mimari Dokümantasyon Rehberi (`/docs`)

Bu dizin, secondHand platformunun yüksek performanslı, olay güdümlü ve finansal güvenliği garanti altına alan modern backend mimarisinin tüm detaylarını barındırır.

---

## 📚 Doküman Haritası

| Doküman | Kapsam ve Açıklama |
| :--- | :--- |
| **[new-payment-system.md](file:///Users/serhat/IdeaProjects/secondHand/docs/new-payment-system.md)** | Ödeme, Stok, Escrow, Kupon, Teklif ve Vitrin sistemlerinin uçtan uca mimari tasarımı, Redis Lua scriptleri, Transactional Outbox Pattern ve Apache Kafka entegrasyon prensipleri. |
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
