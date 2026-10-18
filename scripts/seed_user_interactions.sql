-- ============================================================================
-- Data Enrichment Script for secondHand
-- Enriches: listing_views, favorites, carts, orders, order_items, shippings,
--           payment, escrows, ewallet balances, and reviews.
--
-- Rules Enforced:
-- 1. VEHICLE and REAL_ESTATE are strictly view/favorite only (NEVER carted or ordered).
-- 2. Users never buy or cart their own listings (user_id != seller_id).
-- 3. Double-entry ewallet consistency: buyer balance decreases, seller balance increases,
--    system net balance change = 0.
-- 4. Consistent payment (ITEM_PURCHASE), escrows (COMPLETED), shippings (DELIVERED),
--    inventory decrement, and reviews (4-5 stars).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ENRICH LISTING VIEWS (~220 views across all 18 listings, past 35 days)
-- ----------------------------------------------------------------------------
INSERT INTO listing_views (id, listing_id, user_id, viewer_id, session_id, ip_hash, user_agent, category, price_snapshot, viewed_at)
SELECT 
    gen_random_uuid(),
    l.id,
    u.id,
    u.id,
    'sess_' || substr(md5(random()::text), 1, 16),
    substr(md5((random() * 1000)::text), 1, 32),
    CASE (floor(random() * 3))::int
        WHEN 0 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        WHEN 1 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
        ELSE 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    END,
    l.listing_type,
    l.price,
    NOW() - (random() * interval '35 days')
FROM listings l
CROSS JOIN (
    SELECT id FROM users
    UNION ALL
    SELECT NULL::bigint AS id -- simulate anonymous visitors as well
) u
CROSS JOIN generate_series(1, 2)
WHERE l.status = 'ACTIVE';

-- ----------------------------------------------------------------------------
-- 2. ENRICH FAVORITES (~24 favorites across various categories)
-- ----------------------------------------------------------------------------
INSERT INTO favorites (user_id, listing_id, created_at)
SELECT v.user_id, v.listing_id, v.created_at
FROM (VALUES
    -- Serhat (1004) favorites
    (1004, '61bb5611-ff79-4c91-9037-c63a2eb115ad'::uuid, NOW() - interval '20 days'), -- Lebron Sixers
    (1004, '845a7b6e-457c-4e6d-af4c-e62660d4227f'::uuid, NOW() - interval '18 days'), -- MacBook Pro M4 Max
    (1004, 'b2e9619a-e383-4828-a97b-efeb5b8acb5f'::uuid, NOW() - interval '15 days'), -- Curry Jersey
    (1004, 'f4c33fd0-2923-4715-93ca-6be19f469687'::uuid, NOW() - interval '12 days'), -- BMW 320i (Vehicle)
    (1004, '78786f53-f4b5-4ba2-b5cd-800081b2084b'::uuid, NOW() - interval '10 days'), -- Beykoz Arsa (Real Estate)

    -- Jason Tatum (1005) favorites
    (1005, '826601ee-a12b-4e16-ada0-26e2be139673'::uuid, NOW() - interval '22 days'), -- iPhone 15 Pro Max
    (1005, 'd2335b08-ed7a-4d95-83e9-afdf4c8c7e2e'::uuid, NOW() - interval '19 days'), -- Osimhen Jersey
    (1005, '934571cc-21f7-426f-9d57-446acdb3a50b'::uuid, NOW() - interval '16 days'), -- Kyrie Jersey
    (1005, '14b1b02b-eebe-4d78-aa65-f3a40141424f'::uuid, NOW() - interval '14 days'), -- Mercedes E 220 (Vehicle)
    (1005, '4066b953-8f0b-4c39-b606-d5294628a81d'::uuid, NOW() - interval '8 days'),  -- Levent Rezidans (Real Estate)

    -- Kyrie Irving (1006) favorites
    (1006, 'fff08b8b-7b78-44fe-9034-bdb76aba7664'::uuid, NOW() - interval '25 days'), -- Tatum Jersey
    (1006, 'b2e9619a-e383-4828-a97b-efeb5b8acb5f'::uuid, NOW() - interval '21 days'), -- Curry Jersey
    (1006, 'a944a154-494d-4802-b444-ee216cd394f8'::uuid, NOW() - interval '17 days'), -- Hugo Boss Shirt
    (1006, '64c6a1da-5ec4-4e49-98fa-8e7bb0c637b3'::uuid, NOW() - interval '11 days'), -- Golf 8 (Vehicle)
    (1006, '440a8be4-899f-42c8-a2cd-a382cb95aad5'::uuid, NOW() - interval '5 days'),  -- Harry Potter Book

    -- Stephen Curry (1007) favorites
    (1007, '9fb32572-c953-4de7-8e3a-3e6d369823d0'::uuid, NOW() - interval '23 days'), -- Used MacBook
    (1007, 'ab73a563-077b-40b4-87d1-4355b3af5c7a'::uuid, NOW() - interval '15 days'), -- Gs 22/23 Jersey
    (1007, 'f4c33fd0-2923-4715-93ca-6be19f469687'::uuid, NOW() - interval '9 days'),  -- BMW 320i (Vehicle)
    (1007, '4066b953-8f0b-4c39-b606-d5294628a81d'::uuid, NOW() - interval '7 days'),  -- Levent Rezidans (Real Estate)
    (1007, 'a8fc1e17-6c86-4857-9366-358daad41a4b'::uuid, NOW() - interval '3 days'),  -- Akilli Yatirimci Book

    -- Lebron James (1008) favorites
    (1008, 'fff08b8b-7b78-44fe-9034-bdb76aba7664'::uuid, NOW() - interval '24 days'), -- Tatum Jersey
    (1008, '845a7b6e-457c-4e6d-af4c-e62660d4227f'::uuid, NOW() - interval '13 days'), -- MacBook Pro M4 Max
    (1008, '14b1b02b-eebe-4d78-aa65-f3a40141424f'::uuid, NOW() - interval '6 days'),  -- Mercedes E 220 (Vehicle)
    (1008, 'a944a154-494d-4802-b444-ee216cd394f8'::uuid, NOW() - interval '2 days')   -- Hugo Boss Shirt
) AS v(user_id, listing_id, created_at)
WHERE NOT EXISTS (
    SELECT 1 FROM favorites f WHERE f.user_id = v.user_id AND f.listing_id = v.listing_id
);

-- ----------------------------------------------------------------------------
-- 3. ENRICH CARTS (Active items in user carts - NO VEHICLES, NO REAL ESTATE)
-- ----------------------------------------------------------------------------
INSERT INTO carts (user_id, listing_id, quantity, notes, is_reserved, version, created_at, updated_at)
VALUES
    -- Serhat (1004) has Kyrie Jersey in cart
    (1004, '934571cc-21f7-426f-9d57-446acdb3a50b', 1, 'Koleksiyon için', false, 0, NOW() - interval '2 days', NOW() - interval '2 days'),
    -- Serhat (1004) has Hugo Boss Gömlek in cart
    (1004, 'a944a154-494d-4802-b444-ee216cd394f8', 1, NULL, false, 0, NOW() - interval '1 day', NOW() - interval '1 day'),

    -- Jason Tatum (1005) has Osimhen Jersey in cart
    (1005, 'd2335b08-ed7a-4d95-83e9-afdf4c8c7e2e', 1, 'Hediye olarak', false, 0, NOW() - interval '3 days', NOW() - interval '3 days'),

    -- Kyrie Irving (1006) has Curry Jersey in cart
    (1006, 'b2e9619a-e383-4828-a97b-efeb5b8acb5f', 1, 'İmzalı forma arşivi', false, 0, NOW() - interval '4 days', NOW() - interval '4 days'),
    -- Kyrie Irving (1006) has Harry Potter Book in cart
    (1006, '440a8be4-899f-42c8-a2cd-a382cb95aad5', 1, NULL, false, 0, NOW() - interval '1 day', NOW() - interval '1 day'),

    -- Stephen Curry (1007) has Used Macbook in cart
    (1007, '9fb32572-c953-4de7-8e3a-3e6d369823d0', 1, 'Yedek cihaz için', false, 0, NOW() - interval '2 days', NOW() - interval '2 days'),
    -- Stephen Curry (1007) has Lebron Sixers Jersey in cart
    (1007, '61bb5611-ff79-4c91-9037-c63a2eb115ad', 1, NULL, false, 0, NOW() - interval '1 day', NOW() - interval '1 day'),

    -- Lebron James (1008) has Tatum Jersey in cart
    (1008, 'fff08b8b-7b78-44fe-9034-bdb76aba7664', 1, 'Forma değişimi', false, 0, NOW() - interval '2 days', NOW() - interval '2 days')
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. ENRICH COMPLETED ORDERS, PAYMENTS, ESCROWS, INVENTORY, AND WALLETS
-- Executed via PL/pgSQL to maintain strict double-entry ledger balance.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    rec RECORD;
    v_order_id BIGINT;
    v_order_item_id BIGINT;
    v_payment_id UUID;
    v_order_num VARCHAR(100);
    v_order_date TIMESTAMP;
    v_tracking_num VARCHAR(50);
BEGIN
    -- Temporary table defining 7 realistic purchases (ONLY ELECTRONICS, SPORTS, BOOKS, CLOTHING)
    CREATE TEMP TABLE tmp_purchases (
        buyer_id BIGINT,
        seller_id BIGINT,
        listing_id UUID,
        listing_title VARCHAR(255),
        listing_no VARCHAR(20),
        listing_type VARCHAR(50),
        unit_price NUMERIC(10,2),
        shipping_addr_id BIGINT,
        days_ago INT,
        review_rating INT,
        review_comment TEXT
    ) ON COMMIT DROP;

    INSERT INTO tmp_purchases VALUES
        -- Order 1: Stephen Curry (1007) buys MacBook Pro M4 Max (128,500 TL) from Jason Tatum (1005)
        (1007, 1005, '845a7b6e-457c-4e6d-af4c-e62660d4227f', 
         'MacBook Pro 16" M4 Max (64GB RAM / 1TB SSD) Uzay Siyahı - 2026 TR Garantili', 
         'F54AC971', 'ELECTRONICS', 128500.00, 1006, 28, 5, 
         'Cihaz eksiksiz ve sıfır ayarında geldi. Paketleme çok özenliydi, teşekkür ederim.'),

        -- Order 2: Lebron James (1008) buys Kyrie Jersey (52,500 TL) from Kyrie Irving (1006)
        (1008, 1006, '934571cc-21f7-426f-9d57-446acdb3a50b', 
         'Kyrie Irving 2016 Cavs Jersey', 
         '2JMSOGSQ', 'SPORTS', 52500.00, 1007, 24, 5, 
         '2016 şampiyonluk hatırası efsane bir forma. Çok hızlı kargolandı.'),

        -- Order 3: Jason Tatum (1005) buys Harry Potter Book (1,450 TL) from Serhat (1004)
        (1005, 1004, '440a8be4-899f-42c8-a2cd-a382cb95aad5', 
         'Harry Potter ve Felsefe Taşı (Resimli Özel Koleksiyon Ciltli Baskı)', 
         '3D8363AE', 'BOOKS', 1450.00, 1004, 20, 5, 
         'Kitap kusursuz durumda, koleksiyon baskı gerçekten çok kaliteli.'),

        -- Order 4: Kyrie Irving (1006) buys Hugo Boss Shirt (3,450 TL) from Jason Tatum (1005)
        (1006, 1005, 'a944a154-494d-4802-b444-ee216cd394f8', 
         'Hugo Boss Slim Fit %100 Pamuk Beyaz Erkek Gömlek (Orijinal)', 
         'C63B3639', 'CLOTHING', 3450.00, 1005, 16, 5, 
         'Orijinal ürün, bedeni tam oldu. Hızlı kargo için satıcıya teşekkürler.'),

        -- Order 5: Serhat (1004) buys Lebron Sixers Jersey (7,500 TL) from Lebron James (1008)
        (1004, 1008, '61bb5611-ff79-4c91-9037-c63a2eb115ad', 
         'Lebron James Sixers', 
         '7BUF9Z9M', 'SPORTS', 7500.00, 1008, 12, 5, 
         'Forma orijinal ve çok temiz. Çok memnun kaldım.'),

        -- Order 6: Stephen Curry (1007) buys Gs 22/23 Jersey (28,000 TL) from Serhat (1004)
        (1007, 1004, 'ab73a563-077b-40b4-87d1-4355b3af5c7a', 
         'Gs 22/23 iç saha forması', 
         'ZG806TC2', 'SPORTS', 28000.00, 1006, 8, 5, 
         'Nadir bulunan harika bir şampiyonluk forması. Güvenilir satıcı.'),

        -- Order 7: Jason Tatum (1005) buys Akıllı Yatırımcı Book (559 TL) from Serhat (1004)
        (1005, 1004, 'a8fc1e17-6c86-4857-9366-358daad41a4b', 
         'Akıllı Yatırımcı kitabı', 
         'FLYPR8BT', 'BOOKS', 559.00, 1004, 4, 4, 
         'Kondisyonu anlatıldığı gibiydi, uygun fiyata iyi bir kaynak.');

    -- Process each purchase atomically
    FOR rec IN SELECT * FROM tmp_purchases LOOP
        v_order_date := NOW() - (rec.days_ago || ' days')::interval;
        v_order_num := 'ORD-' || (EXTRACT(EPOCH FROM v_order_date)*1000)::bigint || '-' || upper(substr(md5(random()::text), 1, 8));
        v_tracking_num := 'TRK' || (EXTRACT(EPOCH FROM v_order_date)*1000 + 720000)::bigint;

        -- 4a. Create Payment row (status COMPLETED, transaction_type ITEM_PURCHASE)
        INSERT INTO payment (
            id, amount, status, transaction_type, payment_direction, currency,
            from_user_id, to_user_id, listing_id, listing_title, listing_no,
            provider_name, is_success, created_at, updated_at, processed_at, version
        ) VALUES (
            gen_random_uuid(), rec.unit_price, 'COMPLETED', 'ITEM_PURCHASE', 'OUTGOING', 'TRY',
            rec.buyer_id, rec.seller_id, rec.listing_id, rec.listing_title, rec.listing_no,
            'EWALLET', true, v_order_date, v_order_date, v_order_date, 0
        ) RETURNING id INTO v_payment_id;

        -- 4b. Create Order
        INSERT INTO orders (
            order_number, external_id, user_id, status, total_amount, subtotal, currency,
            shipping_address_id, billing_address_id, payment_reference, payment_status,
            payment_provider_name, delivery_method, created_at, updated_at, version
        ) VALUES (
            v_order_num, gen_random_uuid(), rec.buyer_id, 'COMPLETED', rec.unit_price, rec.unit_price, 'TRY',
            rec.shipping_addr_id, rec.shipping_addr_id, v_payment_id::text, 'COMPLETED',
            'EWALLET', 'CARGO', v_order_date, v_order_date + interval '2 days', 0
        ) RETURNING id INTO v_order_id;

        -- Link order_id to payment
        UPDATE payment SET order_id = (SELECT external_id FROM orders WHERE id = v_order_id) WHERE id = v_payment_id;

        -- 4c. Create Order Item
        INSERT INTO order_items (
            order_id, listing_id, seller_id, listing_type, quantity, unit_price, total_price, currency, created_at
        ) VALUES (
            v_order_id, rec.listing_id, rec.seller_id, rec.listing_type,
            1, rec.unit_price, rec.unit_price, 'TRY', v_order_date
        ) RETURNING id INTO v_order_item_id;

        -- Link order_item_id to payment
        UPDATE payment SET order_item_id = v_order_item_id WHERE id = v_payment_id;

        -- 4d. Create Shipping row (status DELIVERED)
        INSERT INTO shippings (
            order_id, tracking_number, provider_name, provider_shipment_id, shipping_cost,
            status, shipped_at, in_transit_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_tracking_num, 'ARAS', 'SIM-' || v_tracking_num, 0.00,
            'DELIVERED', v_order_date + interval '2 hours', v_order_date + interval '6 hours',
            v_order_date + interval '2 days', v_order_date, v_order_date + interval '2 days'
        );

        -- 4e. Create Escrow row (status COMPLETED)
        INSERT INTO escrows (
            order_id, order_item_id, buyer_id, seller_id, amount, status,
            listing_id, listing_title, listing_no, blocked_at, released_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_order_item_id, rec.buyer_id, rec.seller_id, rec.unit_price, 'COMPLETED',
            rec.listing_id, rec.listing_title, rec.listing_no,
            v_order_date, v_order_date + interval '2 days', v_order_date, v_order_date + interval '2 days'
        );

        -- 4f. Update E-Wallet Balances (Buyer - Amount, Seller + Amount)
        UPDATE ewallet SET balance = balance - rec.unit_price, updated_at = NOW(), version = version + 1 WHERE user_id = rec.buyer_id;
        UPDATE ewallet SET balance = balance + rec.unit_price, updated_at = NOW(), version = version + 1 WHERE user_id = rec.seller_id;

        -- 4g. Update Inventory Quantity (-1)
        UPDATE inventory SET available_quantity = available_quantity - 1, updated_at = NOW(), version = version + 1 WHERE listing_id = rec.listing_id;

        -- 4h. Create Review for this Order Item
        INSERT INTO reviews (
            reviewer_id, reviewed_user_id, order_item_id, rating, comment, created_at, updated_at
        ) VALUES (
            rec.buyer_id, rec.seller_id, v_order_item_id, rec.review_rating, rec.review_comment,
            v_order_date + interval '2 days 2 hours', v_order_date + interval '2 days 2 hours'
        );
    END LOOP;
END $$;

COMMIT;
