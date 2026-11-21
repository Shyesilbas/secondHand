# ADR-0002: Redis Lua ile stok rezervasyonu, PostgreSQL'de kalıcı stok

- **Durum:** Kabul edildi
- **Kapsam:** `inventory`, `cart`, `checkout`

## Bağlam
Aynı ilana eşzamanlı çok sayıda checkout gelebilir. `SELECT ... FOR UPDATE` satır kilidi bu yükte bekleme ve deadlock riski yaratır. Ayrıca sepetteki ürünü sonsuza kadar tutmak (*hoarding*) başka alıcıları engeller.

## Karar
Satılabilir stok Redis'te (`v4:inventory:stock:{listingId}`) atomik Lua script'leriyle (`reserve_stock_with_ttl.lua`, `release_stock.lua` vb.) yönetilir ve rezervasyon 15 dakika TTL ile tutulur. Asıl kayıt PostgreSQL'de `Inventory.availableQuantity` olarak kalır; ödeme tamamlanınca Kafka consumer'ı (`InventoryKafkaConsumer`) düşümü yapar.

## Sonuçlar
- Kazanç: Checkout'ta satır kilidi beklenmez; TTL sayesinde terk edilen rezervasyon kendiliğinden düşer.
- Maliyet: İki kayıt aynı anda güncellenmediği için kısa süreli fark normaldir. Açıklanamayan fark `StockReservationReconciliationScheduler` ile düzeltilir (varsayılan 5 dk).
- Maliyet: Redis kaybı stok doğruluğunu etkiler; reconciliation bu yüzden zorunlu bir parçadır, opsiyonel değildir.
- Kural: Stok/para değişikliğine dokunan her düzeltme, düzeltme olmadan başarısız olan bir birim test ile gelir.

## Kod Referansları
[stock-reservation-and-reconciliation.md](../stock-reservation-and-reconciliation.md) · [checkout-pipeline-and-distributed-transaction-flow.md](../checkout-pipeline-and-distributed-transaction-flow.md) · `InventoryRedisReservationService`
