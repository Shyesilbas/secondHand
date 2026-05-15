-- Great Seller: önceki uygunluk durumu (geçiş bildirimi + ilk yükte spam önleme için null davranışı)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS great_seller_eligible_snapshot BOOLEAN NULL;

-- Sipariş penceresi + ödeme durumuna göre sorgular için (Great Seller toplu sorgu)
CREATE INDEX IF NOT EXISTS idx_orders_gs_eligible_window
    ON orders (payment_status, status, created_at);
