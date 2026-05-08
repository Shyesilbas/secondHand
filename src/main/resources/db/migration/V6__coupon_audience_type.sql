-- Rule-based coupons (e.g. first order) vs whitelist / everyone
ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS audience VARCHAR(50) NOT NULL DEFAULT 'ALL_USERS';

UPDATE coupons SET audience =
    CASE
        WHEN for_all_users THEN 'ALL_USERS'
        ELSE 'USER_ID_LIST'
    END;
