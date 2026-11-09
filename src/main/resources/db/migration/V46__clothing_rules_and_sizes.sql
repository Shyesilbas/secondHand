-- Clothing on rule-driven types: each type carries its group, the size systems per audience and field rules
-- (data/clothing/types.json); brands carry a price segment. Listings get one audience instead of gender +
-- category, one size (system + key, data/common/sizes.json) instead of letter size + shoe size, an optional
-- purchase year instead of a date, and the new condition scale. Old columns are copied, then dropped.

ALTER TABLE clothing_types
    ADD COLUMN clothing_group VARCHAR(20),
    ADD COLUMN sort_order     INT   NOT NULL DEFAULT 0,
    ADD COLUMN size_rules     JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN field_rules    JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE clothing_brands
    ADD COLUMN segment VARCHAR(20);

ALTER TABLE clothing_listings
    ADD COLUMN audience      VARCHAR(20),
    ADD COLUMN size_system   VARCHAR(30),
    ADD COLUMN size_key      VARCHAR(30),
    ADD COLUMN purchase_year INT;

UPDATE clothing_listings
SET audience = CASE clothing_category
                   WHEN 'FEMALE_ADULT' THEN 'WOMEN'
                   WHEN 'MALE_ADULT' THEN 'MEN'
                   WHEN 'GIRL_CHILD' THEN 'GIRL'
                   WHEN 'GIRL_YOUTH' THEN 'GIRL'
                   WHEN 'BOY_CHILD' THEN 'BOY'
                   WHEN 'BOY_YOUTH' THEN 'BOY'
                   WHEN 'GIRL_BABY' THEN 'BABY'
                   WHEN 'BOY_BABY' THEN 'BABY'
                   ELSE CASE clothing_gender WHEN 'FEMALE' THEN 'WOMEN' WHEN 'MALE' THEN 'MEN' ELSE 'UNISEX' END
    END;

UPDATE clothing_listings
SET size_system = CASE
                      WHEN size IS NOT NULL THEN 'LETTER'
                      WHEN shoe_size_eu BETWEEN 35 AND 48 THEN 'SHOE_EU'
                      WHEN shoe_size_eu BETWEEN 16 AND 34 THEN 'KIDS_SHOE_EU'
                      ELSE 'ONE_SIZE'
    END,
    size_key    = CASE
                      WHEN size IS NOT NULL THEN size
                      WHEN shoe_size_eu BETWEEN 16 AND 48 THEN shoe_size_eu::text
                      ELSE 'ONE_SIZE'
        END,
    purchase_year = EXTRACT(YEAR FROM purchase_date)::int,
    condition     = CASE condition
                        WHEN 'EXCELLENT' THEN 'VERY_GOOD'
                        WHEN 'FAIR' THEN 'GOOD'
                        WHEN 'WORN' THEN 'FLAWED'
                        WHEN 'DAMAGED' THEN 'FLAWED'
                        ELSE condition
        END;

-- Merged types: listings move to the type that stays; the seed then prunes the old rows.
UPDATE clothing_listings
SET clothing_type_id = (SELECT id FROM clothing_types WHERE name = 'TRENCH_COAT')
WHERE clothing_type_id = (SELECT id FROM clothing_types WHERE name = 'OVERCOAT')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE name = 'TRENCH_COAT');

UPDATE clothing_listings
SET clothing_type_id = (SELECT id FROM clothing_types WHERE name = 'SWIMWEAR')
WHERE clothing_type_id = (SELECT id FROM clothing_types WHERE name = 'BIKINI')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE name = 'SWIMWEAR');

ALTER TABLE clothing_listings
    ALTER COLUMN audience SET NOT NULL,
    DROP COLUMN clothing_gender,
    DROP COLUMN clothing_category,
    DROP COLUMN size,
    DROP COLUMN shoe_size_eu,
    DROP COLUMN material,
    DROP COLUMN purchase_date;

CREATE INDEX idx_clothing_listings_audience ON clothing_listings (audience);
CREATE INDEX idx_clothing_listings_size ON clothing_listings (size_system, size_key);
