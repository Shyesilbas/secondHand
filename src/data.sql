-- Sample Vehicle Listing for sellerId = 1
-- VOLKSWAGEN GOLF 8 Rline, 18k km, ATLANTIC_BLUE, 4 doors, HYBRID

-- Insert into listings table (parent)
INSERT INTO listings (id, title, description, price, currency, status, city, district, seller_id, created_at, updated_at, listing_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'VOLKSWAGEN GOLF 8 R-Line - 2022 Model Hibrit',
    'Temiz kullanılmış, bakımlı Golf 8 R-Line. Hibrit motor sistemi ile düşük yakıt tüketimi. Garaj çıkışlı, hasarsız araç.',
    1250000.00,
    'TRY',
    'ACTIVE',
    'İstanbul',
    'Beykoz',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'VEHICLE'
);

-- Insert into vehicle_listings table (child)
INSERT INTO vehicle_listings (id, brand, model, year, mileage, engine_capacity, gearbox, seat_count, doors, wheels, color, fuel_capacity, fuel_consumption, horse_power, kilometers_per_liter, fuel_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'VOLKSWAGEN',
    'GOLF 8 R-Line',
    2022,
    18000,
    1500,
    7,  -- 7-speed DSG
    5,
    'FOUR',
    17,  -- 17 inch wheels
    'ATLANTIC_BLUE',
    50,
    5,
    150,
    20,
    'HYBRID'
);