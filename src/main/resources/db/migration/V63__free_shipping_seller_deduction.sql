-- Free shipping above a threshold: the buyer pays no shipping fee and the seller carries it instead.
-- orders.seller_shipping_charge is the amount fixed at order time; escrows.shipping_deduction is the item's share,
-- withheld from the seller payout on release and credited to the system account.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS shipping_deduction NUMERIC(10, 2) NOT NULL DEFAULT 0;
