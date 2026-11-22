# ADR-0003: Escrow kaydı `OrderItem` başına

- **Durum:** Kabul edildi
- **Kapsam:** `escrow`, `order`, `payment`, `ewallet`

## Bağlam
Bir sipariş birden fazla satıcıya ait kalem içerebilir ve kalemler ayrı ayrı iptal ya da iade edilebilir. Tek bir sipariş seviyesinde escrow, kısmi iptal ve satıcı bazlı ödeme için yetersiz kalır.

## Karar
`escrows` tablosunda her `OrderItem` için bir satır tutulur (`order_item_id` benzersiz). Tutar kampanya ve kupon sonrası net tutardır. Satıcıya aktarım, sipariş tamamlandığında `ESCROW_RELEASED` outbox event'i ve `escrow.released.v1` topic'i üzerinden eWallet'a kredi olarak yapılır ([ADR-0001](0001-transactional-outbox-with-polling.md)). Hold için ikinci bir `payments` satırı oluşturulmaz. Platform kuponu indirimi satıcıyı etkilemez: kalemin kupon payı `platform_subsidy` kolonunda tutulur, serbest bırakmada satıcıya `amount + platform_subsidy` ödenir, iade ise yalnızca `amount` kadardır.

## Sonuçlar
- Kazanç: Kalem bazlı iptal/iade ve çoklu satıcı siparişi doğal olarak modellenir.
- Kural: İade yalnızca `PaymentStatus.ESCROW` durumundaki satır için mümkündür ve para her zaman alıcıya gider. `COMPLETED` olan escrow geri alınamaz.
- Maliyet: Sipariş toplamı için kalemlerin toplanması gerekir; sipariş seviyesinde tek bir bakiye satırı yoktur.

## Kod Referansları
[escrow-lifecycle-and-state-machine.md](../escrow-lifecycle-and-state-machine.md) · [order-lifecycle-and-compensation-management.md](../order-lifecycle-and-compensation-management.md) · `EscrowService`
