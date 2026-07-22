-- =============================================================================
-- V2: Seed reference data and sample listings for all listing categories
-- High-reliability seed script with fixed deterministic UUIDs.
-- =============================================================================

-- ─── 1. CORE USERS AND ADDRESSES ─────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, name, surname, username, phone, profile_image_url, seller_rating, is_great_seller, plan, auto_renew, created_at, updated_at)
VALUES
(1001, 'seller1@example.com', '$2a$10$D8b...hash1', 'Ahmet', 'Yilmaz', 'ahmetyilmaz', '+905321112233', 'https://picsum.photos/200', 4.85, true, 'PREMIUM', true, NOW(), NOW()),
(1002, 'seller2@example.com', '$2a$10$D8b...hash2', 'Ayse', 'Kaya', 'aysekaya', '+905334445566', 'https://picsum.photos/200', 4.90, true, 'STANDARD', true, NOW(), NOW()),
(1003, 'buyer1@example.com', '$2a$10$D8b...hash3', 'Mehmet', 'Demir', 'mehmetd', '+905357778899', 'https://picsum.photos/200', 0.00, false, 'FREE', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO addresses (id, user_id, address_line, city, state, postal_code, country, address_type, main_address)
VALUES
(1001, 1001, 'Kadikoy Cad. No: 12', 'Istanbul', 'Kadikoy', '34710', 'Turkey', 'DELIVERY', true),
(1002, 1002, 'Cankaya Mah. 100. Yil Sok. No: 5', 'Ankara', 'Cankaya', '06530', 'Turkey', 'DELIVERY', true),
(1003, 1003, 'Alsancak Bulvari No: 45', 'Izmir', 'Konak', '35220', 'Turkey', 'DELIVERY', true)
ON CONFLICT (id) DO NOTHING;

-- Reset identity sequence for users and addresses
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses));


-- ─── 2. REAL ESTATE REFERENCE DATA & LISTING ──────────────────────────────────
INSERT INTO real_estate_types (id, name) VALUES
('10000001-0000-0000-0000-000000000001', 'APARTMENT'),
('10000001-0000-0000-0000-000000000002', 'RESIDENCE'),
('10000001-0000-0000-0000-000000000003', 'STUDIO'),
('10000001-0000-0000-0000-000000000006', 'HOUSE'),
('10000001-0000-0000-0000-000000000007', 'VILLA'),
('10000001-0000-0000-0000-000000000012', 'LAND'),
('10000001-0000-0000-0000-000000000016', 'OFFICE'),
('10000001-0000-0000-0000-000000000018', 'SHOP'),
('10000001-0000-0000-0000-000000000024', 'OTHER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO real_estate_ad_types (id, name) VALUES
('20000002-0000-0000-0000-000000000001', 'FOR_SALE'),
('20000002-0000-0000-0000-000000000002', 'FOR_RENT'),
('20000002-0000-0000-0000-000000000003', 'DAILY_RENTAL')
ON CONFLICT (id) DO NOTHING;

INSERT INTO heating_types (id, name) VALUES
('30000003-0000-0000-0000-000000000001', 'NATURAL_GAS_COMBI'),
('30000003-0000-0000-0000-000000000002', 'CENTRAL_HEATING'),
('30000003-0000-0000-0000-000000000003', 'AIR_CONDITIONING'),
('30000003-0000-0000-0000-000000000004', 'UNDERFLOOR_HEATING'),
('30000003-0000-0000-0000-000000000005', 'STOVE'),
('30000003-0000-0000-0000-000000000006', 'NONE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_owner_types (id, name) VALUES
('40000004-0000-0000-0000-000000000001', 'OWNER'),
('40000004-0000-0000-0000-000000000002', 'REAL_ESTATE_AGENT'),
('40000004-0000-0000-0000-000000000003', 'CONSTRUCTION_COMPANY')
ON CONFLICT (id) DO NOTHING;

-- Seed Real Estate Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000001', 'RE100001', 'Luks Kadikoy Moda 3+1 Daire', 'Deniz manzarali, yeni tadilatli, kombili 130m2 daire.', 8500000.00, 'TRY', 'ACTIVE', 'REAL_ESTATE', true, 'Istanbul', 'Kadikoy', 'istanbul', 'kadikoy', true, 'https://picsum.photos/800/600', 1001, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO real_estate_listings (id, room_count, square_meters, gross_area_m2, net_area_m2, building_age, is_furnished, monthly_fee, real_estate_type_id, ad_type_id, owner_type_id)
VALUES ('a1000000-0000-0000-0000-000000000001', 3, 130, 140, 130, 5, true, 1200.00, '10000001-0000-0000-0000-000000000001', '20000002-0000-0000-0000-000000000001', '40000004-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a1000000-0000-0000-0000-000000000001', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;


-- ─── 3. VEHICLE REFERENCE DATA & LISTING ───────────────────────────────────────
INSERT INTO vehicle_types (id, name) VALUES
('50000005-0000-0000-0000-000000000001', 'CAR'),
('50000005-0000-0000-0000-000000000002', 'MOTORCYCLE'),
('50000005-0000-0000-0000-000000000003', 'SUV')
ON CONFLICT (id) DO NOTHING;

INSERT INTO car_brands (id, name) VALUES
('51000005-0000-0000-0000-000000000001', 'BMW'),
('51000005-0000-0000-0000-000000000002', 'Mercedes-Benz'),
('51000005-0000-0000-0000-000000000003', 'Volkswagen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicle_models (id, name, car_brand_id) VALUES
('52000005-0000-0000-0000-000000000001', '3 Series', '51000005-0000-0000-0000-000000000001'),
('52000005-0000-0000-0000-000000000002', 'C-Class', '51000005-0000-0000-0000-000000000002'),
('52000005-0000-0000-0000-000000000003', 'Golf', '51000005-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Seed Vehicle Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a2000000-0000-0000-0000-000000000002', 'VE100002', '2021 BMW 320i M Sport', 'Hatasiz boyasiz yetkili servis bakimli temiz arac.', 2150000.00, 'TRY', 'ACTIVE', 'VEHICLE', true, 'Ankara', 'Cankaya', 'ankara', 'cankaya', true, 'https://picsum.photos/800/601', 1002, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicle_listings (id, mileage, year, color, fuel_type, gearbox, horse_power, engine_capacity, body_type, vehicle_type_id, car_brand_id, vehicle_model_id)
VALUES ('a2000000-0000-0000-0000-000000000002', 45000, 2021, 'Siyah', 'GASOLINE', 'AUTOMATIC', 170, 1597, 'SEDAN', '50000005-0000-0000-0000-000000000001', '51000005-0000-0000-0000-000000000001', '52000005-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a2000000-0000-0000-0000-000000000002', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;


-- ─── 4. ELECTRONIC REFERENCE DATA & LISTING ────────────────────────────────────
INSERT INTO electronic_types (id, name) VALUES
('60000006-0000-0000-0000-000000000001', 'SMARTPHONE'),
('60000006-0000-0000-0000-000000000002', 'LAPTOP'),
('60000006-0000-0000-0000-000000000003', 'TABLET'),
('60000006-0000-0000-0000-000000000004', 'HEADPHONES')
ON CONFLICT (id) DO NOTHING;

INSERT INTO electronic_brands (id, name) VALUES
('61000006-0000-0000-0000-000000000001', 'Apple'),
('61000006-0000-0000-0000-000000000002', 'Samsung'),
('61000006-0000-0000-0000-000000000003', 'Sony')
ON CONFLICT (id) DO NOTHING;

INSERT INTO electronic_models (id, name, brand_id) VALUES
('62000006-0000-0000-0000-000000000001', 'iPhone 14 Pro', '61000006-0000-0000-0000-000000000001'),
('62000006-0000-0000-0000-000000000002', 'MacBook Air M2', '61000006-0000-0000-0000-000000000001'),
('62000006-0000-0000-0000-000000000003', 'Galaxy S23', '61000006-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Seed Electronic Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a3000000-0000-0000-0000-000000000003', 'EL100003', 'Apple MacBook Air M2 16GB 512GB', 'Kutulu faturali garantisi devam eden tertemiz cihaz.', 42500.00, 'TRY', 'ACTIVE', 'ELECTRONIC', true, 'Izmir', 'Konak', 'izmir', 'konak', true, 'https://picsum.photos/800/602', 1001, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO electronic_listings (id, warranty_proof, has_box, has_invoice, electronic_type_id, electronic_brand_id, electronic_model_id, ram, storage, condition)
VALUES ('a3000000-0000-0000-0000-000000000003', true, true, true, '60000006-0000-0000-0000-000000000002', '61000006-0000-0000-0000-000000000001', '62000006-0000-0000-0000-000000000002', 16, 512, 'LIKE_NEW')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a3000000-0000-0000-0000-000000000003', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;


-- ─── 5. CLOTHING REFERENCE DATA & LISTING ──────────────────────────────────────
INSERT INTO clothing_types (id, name) VALUES
('70000007-0000-0000-0000-000000000001', 'JACKET'),
('70000007-0000-0000-0000-000000000002', 'DRESS'),
('70000007-0000-0000-0000-000000000003', 'SHOES'),
('70000007-0000-0000-0000-000000000004', 'SHIRT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clothing_brands (id, name) VALUES
('71000007-0000-0000-0000-000000000001', 'Zara'),
('71000007-0000-0000-0000-000000000002', 'Nike'),
('71000007-0000-0000-0000-000000000003', 'Massimo Dutti')
ON CONFLICT (id) DO NOTHING;

-- Seed Clothing Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a4000000-0000-0000-0000-000000000004', 'CL100004', 'Massimo Dutti Deri Ceket M Beden', 'Hakiki deri, hic giyilmedi etiketli urun.', 3200.00, 'TRY', 'ACTIVE', 'CLOTHING', true, 'Istanbul', 'Kadikoy', 'istanbul', 'kadikoy', true, 'https://picsum.photos/800/603', 1002, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO clothing_listings (id, clothing_type_id, clothing_brand_id, size, color, clothing_gender, clothing_category, condition)
VALUES ('a4000000-0000-0000-0000-000000000004', '70000007-0000-0000-0000-000000000001', '71000007-0000-0000-0000-000000000003', 'M', 'BLACK', 'MEN', 'OUTERWEAR', 'NEW_WITH_TAGS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a4000000-0000-0000-0000-000000000004', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;


-- ─── 6. BOOKS REFERENCE DATA & LISTING ─────────────────────────────────────────
INSERT INTO book_genres (id, name) VALUES
('80000008-0000-0000-0000-000000000001', 'FICTION'),
('80000008-0000-0000-0000-000000000002', 'SCIENCE_FICTION'),
('80000008-0000-0000-0000-000000000003', 'HISTORY'),
('80000008-0000-0000-0000-000000000004', 'BUSINESS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_types (id, name) VALUES
('81000008-0000-0000-0000-000000000001', 'NOVEL'),
('81000008-0000-0000-0000-000000000002', 'TEXTBOOK'),
('81000008-0000-0000-0000-000000000003', 'BIOGRAPHY')
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_languages (id, name) VALUES
('82000008-0000-0000-0000-000000000001', 'TURKISH'),
('82000008-0000-0000-0000-000000000002', 'ENGLISH')
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_formats (id, name) VALUES
('83000008-0000-0000-0000-000000000001', 'PAPERBACK'),
('83000008-0000-0000-0000-000000000002', 'HARDCOVER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_conditions (id, name) VALUES
('84000008-0000-0000-0000-000000000001', 'LIKE_NEW'),
('84000008-0000-0000-0000-000000000002', 'GOOD'),
('84000008-0000-0000-0000-000000000003', 'ACCEPTABLE')
ON CONFLICT (id) DO NOTHING;

-- Seed Books Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a5000000-0000-0000-0000-000000000005', 'BK100005', 'Dune Serisi Ozel Ciltli Set (6 Kitap)', 'Frank Herbert dune serisi ingilizce ozel ciltli baski.', 1450.00, 'TRY', 'ACTIVE', 'BOOKS', true, 'Ankara', 'Cankaya', 'ankara', 'cankaya', true, 'https://picsum.photos/800/604', 1001, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO books_listings (id, book_genre_id, book_type_id, book_language_id, book_format_id, book_condition_id, author, isbn, publisher, publication_year, page_count)
VALUES ('a5000000-0000-0000-0000-000000000005', '80000008-0000-0000-0000-000000000002', '81000008-0000-0000-0000-000000000001', '82000008-0000-0000-0000-000000000002', '83000008-0000-0000-0000-000000000002', '84000008-0000-0000-0000-000000000001', 'Frank Herbert', '9780441172719', 'Ace Books', 2019, 896)
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a5000000-0000-0000-0000-000000000005', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;


-- ─── 7. SPORTS REFERENCE DATA & LISTING ────────────────────────────────────────
INSERT INTO sport_disciplines (id, name) VALUES
('90000009-0000-0000-0000-000000000001', 'CYCLING'),
('90000009-0000-0000-0000-000000000002', 'FITNESS'),
('90000009-0000-0000-0000-000000000003', 'TENNIS'),
('90000009-0000-0000-0000-000000000004', 'CAMPING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sport_equipment_types (id, name) VALUES
('91000009-0000-0000-0000-000000000001', 'BICYCLE'),
('91000009-0000-0000-0000-000000000002', 'RACKET'),
('91000009-0000-0000-0000-000000000003', 'TENT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sport_conditions (id, name) VALUES
('92000009-0000-0000-0000-000000000001', 'EXCELLENT'),
('92000009-0000-0000-0000-000000000002', 'GOOD'),
('92000009-0000-0000-0000-000000000003', 'FAIR')
ON CONFLICT (id) DO NOTHING;

-- Seed Sports Listing
INSERT INTO listings (id, listing_no, title, description, price, currency, status, listing_type, is_listing_fee_paid, city, district, city_key, district_key, allow_meetup, image_url, seller_id, version, created_at, updated_at)
VALUES ('a6000000-0000-0000-0000-000000000006', 'SP100006', 'Trek Marlin 7 Dag Bisikleti L Beden', 'Az kullanilmis, Shimano vitesli aluminyum kadro bisiklet.', 18500.00, 'TRY', 'ACTIVE', 'SPORTS', true, 'Izmir', 'Konak', 'izmir', 'konak', true, 'https://picsum.photos/800/605', 1002, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO sports_listings (id, sport_discipline_id, sport_equipment_type_id, sport_condition_id, brand, size, color)
VALUES ('a6000000-0000-0000-0000-000000000006', '90000009-0000-0000-0000-000000000001', '91000009-0000-0000-0000-000000000001', '92000009-0000-0000-0000-000000000001', 'Trek', 'L', 'Kirmizi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (listing_id, available_quantity, version)
VALUES ('a6000000-0000-0000-0000-000000000006', 1, 0)
ON CONFLICT (listing_id) DO NOTHING;
