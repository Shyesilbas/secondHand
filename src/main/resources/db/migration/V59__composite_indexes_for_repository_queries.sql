-- Composite indexes derived from repository query patterns (filter + sort/range columns).
-- Single-column indexes that became a strict prefix of a new composite are dropped.
-- Mirrored as @Index / @UniqueConstraint on the matching JPA entities.

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_updated ON orders (status, updated_at);
DROP INDEX IF EXISTS idx_orders_user_id;

-- Escrow
CREATE INDEX IF NOT EXISTS idx_escrows_order_status ON escrows (order_id, status);
CREATE INDEX IF NOT EXISTS idx_escrows_seller_status ON escrows (seller_id, status);
DROP INDEX IF EXISTS idx_escrows_order_id;
DROP INDEX IF EXISTS idx_escrows_seller_id;

-- Offers
CREATE INDEX IF NOT EXISTS idx_offers_buyer_created ON offers (buyer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_offers_seller_created ON offers (seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_offers_listing_status ON offers (listing_id, status);
DROP INDEX IF EXISTS idx_offers_buyer_id;
DROP INDEX IF EXISTS idx_offers_seller_id;
DROP INDEX IF EXISTS idx_offers_listing_id;

-- Listings
CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON listings (seller_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_status_type ON listings (status, listing_type);
DROP INDEX IF EXISTS idx_listing_seller;
DROP INDEX IF EXISTS idx_listing_status;

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_viewed ON listing_views (listing_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_session_viewed ON listing_views (listing_id, session_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_user_viewed ON listing_views (listing_id, user_id, viewed_at);
DROP INDEX IF EXISTS idx_listing_view_listing;

CREATE INDEX IF NOT EXISTS idx_price_history_listing_changed ON price_history (listing_id, change_date);
DROP INDEX IF EXISTS idx_price_history_listing_id;

CREATE INDEX IF NOT EXISTS idx_showcases_user_status ON showcases (user_id, status);
CREATE INDEX IF NOT EXISTS idx_showcases_listing_status ON showcases (listing_id, status);
DROP INDEX IF EXISTS idx_showcase_user;

-- Favorites
CREATE UNIQUE INDEX IF NOT EXISTS uk_favorites_user_listing ON favorites (user_id, listing_id);
DROP INDEX IF EXISTS idx_favorites_user_id;
CREATE INDEX IF NOT EXISTS idx_favorite_lists_user_name ON favorite_lists (user_id, name);
CREATE INDEX IF NOT EXISTS idx_favorite_list_items_list_listing ON favorite_list_items (favorite_list_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_favorite_list_likes_list_user ON favorite_list_likes (favorite_list_id, user_id);
DROP INDEX IF EXISTS idx_favorite_list_items_favorite_list_id;
DROP INDEX IF EXISTS idx_favorite_list_likes_favorite_list_id;

-- Follows
CREATE INDEX IF NOT EXISTS idx_seller_follows_follower_created ON seller_follows (follower_id, created_at);
CREATE INDEX IF NOT EXISTS idx_seller_follows_followed_created ON seller_follows (followed_id, created_at);
DROP INDEX IF EXISTS idx_seller_follows_seller_id;

-- Comms and notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications (user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON messages (recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_emails_recipient_email ON emails (recipient_email);

-- Identity and verification
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_type_created ON verification_codes (user_id, code_type, created_at);
CREATE INDEX IF NOT EXISTS idx_user_agreements_user_accepted ON user_agreements (user_id, accepted_date);

-- Complaints, coupons, forum, AI chat, audit
CREATE INDEX IF NOT EXISTS idx_complaints_pair ON complaints (complainer_id, complained_user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_user ON coupon_redemptions (coupon_id, user_id);
DROP INDEX IF EXISTS idx_coupon_redemptions_coupon_id;
CREATE INDEX IF NOT EXISTS idx_forum_comment_thread ON forum_comment (thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_timestamp ON chat_messages (user_id, "timestamp");
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_created ON audit_logs (user_email, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type_created ON audit_logs (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_created ON audit_logs (event_status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_type_created ON audit_logs (ip_address, event_type, created_at);
