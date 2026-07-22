-- =============================================================================
-- V1: Complete baseline migration
-- PK types derived from actual JPA entity @Id field declarations.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (Long/BIGSERIAL) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    surname VARCHAR(100),
    username VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    seller_rating DECIMAL(3, 2) DEFAULT 0,
    is_great_seller BOOLEAN NOT NULL DEFAULT FALSE,
    plan VARCHAR(20) NOT NULL DEFAULT 'FREE',
    plan_expiry TIMESTAMP,
    ai_listing_quota INTEGER NOT NULL DEFAULT 1,
    daily_aura_usage INTEGER NOT NULL DEFAULT 0,
    daily_aura_reset_date DATE,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    purchase_date TIMESTAMP,
    price DECIMAL(10, 2),
    provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Addresses (Long/BIGSERIAL, FK → users.id BIGINT) ────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    city_key VARCHAR(60),
    district_key VARCHAR(60),
    neighborhood_key VARCHAR(60),
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address_type VARCHAR(50) NOT NULL,
    main_address BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Tokens (UUID) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id),
    token_value VARCHAR(500) UNIQUE NOT NULL,
    token_type VARCHAR(50) DEFAULT 'REFRESH',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Verification codes (UUID) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id),
    code VARCHAR(10),
    purpose VARCHAR(50),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Listings (UUID, JOINED inheritance) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_no VARCHAR(8) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(10),
    status VARCHAR(50),
    listing_type VARCHAR(100) NOT NULL,
    is_listing_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    city VARCHAR(100),
    district VARCHAR(100),
    city_key VARCHAR(60),
    district_key VARCHAR(60),
    neighborhood_key VARCHAR(60),
    allow_meetup BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    seller_id BIGINT NOT NULL REFERENCES users(id),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listing_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listing_location ON listings(city, district);
CREATE INDEX IF NOT EXISTS idx_listing_location_keys ON listings(city_key, district_key);
CREATE INDEX IF NOT EXISTS idx_listing_created ON listings(created_at);

-- ─── Listing Views (UUID) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    viewer_id BIGINT REFERENCES users(id),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Vehicle reference tables ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS car_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    car_brand_id UUID REFERENCES car_brands(id),
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_model_body_types (
    vehicle_model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    body_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (vehicle_model_id, body_type)
);

CREATE TABLE IF NOT EXISTS vehicle_generations (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT '',
    vehicle_model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_engines (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT '',
    vehicle_generation_id UUID NOT NULL REFERENCES vehicle_generations(id) ON DELETE CASCADE,
    fuel_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS vehicle_trims (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT '',
    vehicle_generation_id UUID NOT NULL REFERENCES vehicle_generations(id) ON DELETE CASCADE
);

-- ─── Vehicle listings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    car_brand_id UUID REFERENCES car_brands(id),
    vehicle_model_id UUID REFERENCES vehicle_models(id),
    year INTEGER,
    mileage INTEGER,
    engine_capacity INTEGER,
    gearbox VARCHAR(50),
    seat_count VARCHAR(20),
    doors VARCHAR(20),
    wheels INTEGER,
    color VARCHAR(50),
    fuel_capacity INTEGER,
    fuel_consumption INTEGER,
    horse_power INTEGER,
    kilometers_per_liter INTEGER,
    fuel_type VARCHAR(50),
    swap BOOLEAN NOT NULL DEFAULT FALSE,
    accident_history BOOLEAN,
    accident_details TEXT,
    inspection_valid_until DATE,
    drivetrain VARCHAR(50),
    body_type VARCHAR(50),
    vehicle_generation_id UUID REFERENCES vehicle_generations(id) ON DELETE SET NULL,
    vehicle_engine_id UUID REFERENCES vehicle_engines(id) ON DELETE SET NULL,
    vehicle_trim_id UUID REFERENCES vehicle_trims(id) ON DELETE SET NULL
);

-- ─── Electronic reference tables ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS electronic_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS electronic_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS electronic_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    brand_id UUID REFERENCES electronic_brands(id),
    type_id UUID REFERENCES electronic_types(id)
);

-- ─── Electronic listings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS electronic_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    electronic_type_id UUID REFERENCES electronic_types(id),
    electronic_brand_id UUID REFERENCES electronic_brands(id),
    electronic_model_id UUID REFERENCES electronic_models(id),
    origin VARCHAR(100),
    warranty_proof BOOLEAN NOT NULL DEFAULT FALSE,
    year INTEGER,
    color VARCHAR(50),
    ram INTEGER,
    storage INTEGER,
    storage_type VARCHAR(50),
    processor VARCHAR(100),
    screen_size INTEGER,
    gpu_model VARCHAR(100),
    operating_system VARCHAR(100),
    battery_health_percent INTEGER,
    battery_capacity_mah INTEGER,
    camera_megapixels INTEGER,
    supports5g BOOLEAN,
    dual_sim BOOLEAN,
    has_nfc BOOLEAN,
    connection_type VARCHAR(50),
    wireless BOOLEAN,
    noise_cancelling BOOLEAN,
    has_microphone BOOLEAN,
    battery_life_hours INTEGER,
    battery_replaced BOOLEAN,
    battery_original BOOLEAN,
    screen_replaced BOOLEAN,
    body_replaced BOOLEAN,
    face_id_working BOOLEAN,
    touch_id_working BOOLEAN,
    has_box BOOLEAN,
    has_invoice BOOLEAN,
    imei_registered BOOLEAN,
    warranty_end_date DATE,
    condition VARCHAR(50) NOT NULL DEFAULT 'USED'
);

-- ─── Real estate reference tables ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS real_estate_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS real_estate_ad_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS heating_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS listing_owner_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

-- ─── Real estate listings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS real_estate_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    real_estate_type_id UUID REFERENCES real_estate_types(id) ON DELETE SET NULL,
    heating_type_id UUID REFERENCES heating_types(id) ON DELETE SET NULL,
    ad_type_id UUID REFERENCES real_estate_ad_types(id) ON DELETE SET NULL,
    owner_type_id UUID REFERENCES listing_owner_types(id) ON DELETE SET NULL,
    square_meters INTEGER NOT NULL DEFAULT 0,
    room_count INTEGER NOT NULL DEFAULT 0,
    bathroom_count INTEGER,
    floor INTEGER,
    building_age INTEGER,
    is_furnished BOOLEAN NOT NULL DEFAULT FALSE,
    zoning_status VARCHAR(120),
    gross_area_m2 INTEGER,
    net_area_m2 INTEGER,
    usage_status VARCHAR(60),
    deed_status VARCHAR(60),
    room_config_key VARCHAR(60),
    floor_number INTEGER,
    total_floors INTEGER,
    has_balcony BOOLEAN NOT NULL DEFAULT FALSE,
    has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
    has_parking BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_fee DECIMAL(19, 2),
    is_in_site BOOLEAN NOT NULL DEFAULT FALSE,
    site_name VARCHAR(120),
    garden_area_m2 INTEGER,
    land_share_m2 INTEGER,
    has_pool BOOLEAN NOT NULL DEFAULT FALSE,
    zoning_status_key VARCHAR(60),
    parcel_no VARCHAR(30),
    block_no VARCHAR(30),
    sheet_no VARCHAR(30),
    floor_area_ratio DECIMAL(19, 2),
    height_limit DECIMAL(19, 2),
    road_frontage DECIMAL(19, 2),
    infrastructure_status_key VARCHAR(60),
    water_source VARCHAR(60),
    electricity_available BOOLEAN NOT NULL DEFAULT FALSE,
    road_access BOOLEAN NOT NULL DEFAULT FALSE,
    building_condition VARCHAR(30),
    is_exchangeable BOOLEAN NOT NULL DEFAULT FALSE,
    has_north_facade BOOLEAN NOT NULL DEFAULT FALSE,
    has_south_facade BOOLEAN NOT NULL DEFAULT FALSE,
    has_east_facade BOOLEAN NOT NULL DEFAULT FALSE,
    has_west_facade BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Clothing ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clothing_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS clothing_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS clothing_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    clothing_type_id UUID REFERENCES clothing_types(id),
    clothing_brand_id UUID REFERENCES clothing_brands(id),
    color VARCHAR(50),
    purchase_date DATE,
    condition VARCHAR(50),
    size VARCHAR(20),
    shoe_size_eu INTEGER,
    material VARCHAR(120),
    clothing_gender VARCHAR(50) NOT NULL,
    clothing_category VARCHAR(50) NOT NULL,
    clothing_fit VARCHAR(30),
    clothing_pattern VARCHAR(30),
    fabric_type VARCHAR(30)
);

-- ─── Books ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS book_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS book_genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT '',
    book_type_id UUID REFERENCES book_types(id)
);

CREATE TABLE IF NOT EXISTS book_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS book_formats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS book_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS books_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    book_genre_id UUID REFERENCES book_genres(id),
    book_type_id UUID REFERENCES book_types(id),
    book_language_id UUID REFERENCES book_languages(id),
    book_format_id UUID REFERENCES book_formats(id),
    book_condition_id UUID REFERENCES book_conditions(id),
    author VARCHAR(200),
    isbn VARCHAR(30),
    publisher VARCHAR(200),
    publication_year INTEGER,
    page_count INTEGER
);

-- ─── Sports ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sport_disciplines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sport_equipment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sport_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sports_listings (
    id UUID PRIMARY KEY REFERENCES listings(id),
    sport_discipline_id UUID REFERENCES sport_disciplines(id),
    sport_equipment_type_id UUID REFERENCES sport_equipment_types(id),
    sport_condition_id UUID REFERENCES sport_conditions(id),
    brand VARCHAR(100),
    size VARCHAR(30),
    color VARCHAR(50)
);

-- ─── Orders (Long/BIGSERIAL) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    external_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2),
    campaign_discount DECIMAL(10, 2),
    coupon_code VARCHAR(100),
    coupon_discount DECIMAL(10, 2),
    discount_total DECIMAL(10, 2),
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    shipping_address_id BIGINT REFERENCES addresses(id),
    billing_address_id BIGINT REFERENCES addresses(id),
    notes VARCHAR(1000),
    payment_reference VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_provider_name VARCHAR(100),
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'CARGO',
    meetup_location VARCHAR(255),
    meetup_verification_code_hash VARCHAR(64),
    verification_attempts INTEGER DEFAULT 0,
    verification_locked_until TIMESTAMP,
    meetup_verified_at TIMESTAMP,
    meetup_verification_code_generated_at TIMESTAMP,
    completed_by_user_id BIGINT REFERENCES users(id),
    completed_at TIMESTAMP,
    meetup_verification_code VARCHAR(10),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ─── Order Items (Long/BIGSERIAL) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    listing_id UUID REFERENCES listings(id),
    seller_id BIGINT REFERENCES users(id),
    listing_type VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item_refunds (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id),
    reason VARCHAR(100) NOT NULL,
    reason_text VARCHAR(1000),
    refunded_quantity INTEGER NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item_cancels (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id),
    reason VARCHAR(100) NOT NULL,
    reason_text VARCHAR(1000),
    cancelled_quantity INTEGER NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Shippings (Long/BIGSERIAL) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shippings (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE REFERENCES orders(id),
    tracking_number VARCHAR(100),
    provider VARCHAR(100),
    provider_name VARCHAR(50),
    provider_shipment_id VARCHAR(100),
    label_url VARCHAR(500),
    shipping_cost NUMERIC(10,2),
    status VARCHAR(50),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    estimated_delivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Payments (UUID) ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id BIGINT REFERENCES orders(id),
    order_item_id BIGINT REFERENCES order_items(id),
    user_id BIGINT REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    transaction_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── E-Wallet (UUID) ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ewallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Escrow (Long/BIGSERIAL) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrows (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE REFERENCES orders(id),
    buyer_id BIGINT REFERENCES users(id),
    seller_id BIGINT REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'HOLDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Carts (Long/BIGSERIAL) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    reserved_at TIMESTAMP,
    reservation_end_time TIMESTAMP,
    is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_carts_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_reservation_end ON carts(reservation_end_time);
CREATE INDEX IF NOT EXISTS idx_cart_reserved ON carts(is_reserved);

-- ─── Offers (UUID) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_id BIGINT NOT NULL REFERENCES users(id),
    seller_id BIGINT NOT NULL REFERENCES users(id),
    parent_offer_id UUID REFERENCES offers(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_status_expires_at ON offers(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);

-- ─── Emails (UUID) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id),
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    email_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    sent_at TIMESTAMP,
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    deleted_at TIMESTAMP,
    delivery_status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_emails_user_deleted ON emails(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_emails_deleted_at ON emails(deleted_at);

-- ─── Chat (Long/BIGSERIAL) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    listing_id VARCHAR(255),
    last_message TEXT,
    last_message_time TIMESTAMP,
    last_message_sender_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_msg_time ON chat_rooms(last_message_time);

CREATE TABLE IF NOT EXISTS chat_room_participants (
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user ON chat_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room ON chat_room_participants(chat_room_id);

-- AI Memory Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- ─── Messages (Long/BIGSERIAL) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    sender_id BIGINT NOT NULL REFERENCES users(id),
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(chat_room_id, created_at);

-- ─── Notifications (UUID) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    action_url VARCHAR(500),
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_user_created ON notifications(user_id, created_at);

CREATE TABLE IF NOT EXISTS notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id),
    event_type VARCHAR(100),
    payload TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Favorite Lists (Long/BIGSERIAL) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorite_lists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorite_list_items (
    id BIGSERIAL PRIMARY KEY,
    favorite_list_id BIGINT NOT NULL REFERENCES favorite_lists(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    note VARCHAR(200),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorite_list_likes (
    id BIGSERIAL PRIMARY KEY,
    favorite_list_id BIGINT NOT NULL REFERENCES favorite_lists(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Favorites (Long/BIGSERIAL) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    listing_id UUID REFERENCES listings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Campaigns ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    discount_kind VARCHAR(50) NOT NULL,
    value DECIMAL(19, 2) NOT NULL,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    apply_to_future_listings BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_seller_created ON campaigns(seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_active_ends ON campaigns(active, ends_at);
CREATE INDEX IF NOT EXISTS idx_campaign_seller_active_time ON campaigns(seller_id, active, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS campaign_eligible_types (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    listing_type VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_eligible_listings (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE
);

-- ─── Seller Follows (Long/BIGSERIAL) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL REFERENCES users(id),
    followed_id BIGINT NOT NULL REFERENCES users(id),
    notify_on_new_listing BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT uk_seller_follows_follower_followed UNIQUE (follower_id, followed_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_follows_seller_id ON seller_follows(followed_id);

-- ─── Coupons ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    for_all_users BOOLEAN NOT NULL DEFAULT TRUE,
    audience VARCHAR(50) NOT NULL DEFAULT 'ALL_USERS',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    discount_kind VARCHAR(50) NOT NULL,
    value DECIMAL(19, 2) NOT NULL,
    min_subtotal DECIMAL(19, 2),
    max_discount DECIMAL(19, 2),
    usage_limit_global INTEGER,
    usage_limit_per_user INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_eligible_users (
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_eligible_types (
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    listing_type VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    order_id BIGINT REFERENCES orders(id),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Payment Outbox Events (UUID) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 10,
    next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_outbox_status_next_attempt ON payment_outbox_events(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_payment_outbox_aggregate ON payment_outbox_events(aggregate_type, aggregate_id);

-- ─── Inventory (UUID) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
    listing_id UUID PRIMARY KEY,
    available_quantity INT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_inventory_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ─── Price History (Long/BIGSERIAL) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id),
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(20) NOT NULL,
    change_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    percentage_change DECIMAL(5, 2)
);

-- ─── Showcases (UUID) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS showcases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    daily_cost DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_showcase_status_end ON showcases(status, end_date);
CREATE INDEX IF NOT EXISTS idx_showcase_user ON showcases(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_created ON showcases(created_at);

-- ─── Agreements (UUID) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agreements (
    agreement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_type VARCHAR(100),
    version VARCHAR(50),
    content TEXT,
    created_date DATE,
    updated_date DATE
);

CREATE TABLE IF NOT EXISTS user_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id),
    agreement_id UUID REFERENCES agreements(agreement_id),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agreement_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code VARCHAR(100) NOT NULL,
    agreement_type VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT uk_agreement_requirements_group_type UNIQUE (group_code, agreement_type)
);

CREATE TABLE IF NOT EXISTS agreement_update_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_type VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_agreement_update_events_type_version UNIQUE (agreement_type, version)
);

-- ─── Complaints (String UUID) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(36) PRIMARY KEY,
    complainer_id BIGINT NOT NULL REFERENCES users(id),
    complained_user_id BIGINT NOT NULL REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    listing_id UUID REFERENCES listings(id),
    description VARCHAR(1000),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_notes VARCHAR(1000),
    resolved_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ─── Forum (Long/BIGSERIAL) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_thread (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000) NOT NULL,
    category VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    user_id BIGINT NOT NULL,
    author_visibility VARCHAR(32) NOT NULL DEFAULT 'ANONYMOUS',
    author_display_name VARCHAR(120) NOT NULL DEFAULT 'Anonymous',
    total_likes BIGINT NOT NULL DEFAULT 0,
    total_dislikes BIGINT NOT NULL DEFAULT 0,
    keywords TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forum_comment (
    id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    author_visibility VARCHAR(32) NOT NULL DEFAULT 'ANONYMOUS',
    author_display_name VARCHAR(120) NOT NULL DEFAULT 'Anonymous',
    parent_comment_id BIGINT,
    content VARCHAR(4000) NOT NULL,
    total_likes BIGINT NOT NULL DEFAULT 0,
    total_dislikes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forum_thread_reaction (
    id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_forum_thread_reaction_thread_user UNIQUE (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_comment_reaction (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_forum_comment_reaction_comment_user UNIQUE (comment_id, user_id)
);

-- ─── Audit Logs (Long/BIGSERIAL) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    user_id BIGINT,
    event_type VARCHAR(100) NOT NULL,
    event_status VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(1000),
    details TEXT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Great Seller Eligibility Snapshot ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS great_seller_eligibility_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id),
    is_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    snapshot_date DATE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
