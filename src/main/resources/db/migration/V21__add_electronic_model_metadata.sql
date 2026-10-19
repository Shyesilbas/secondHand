-- ─── Add metadata columns to electronic_models ──────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'electronic_models' AND column_name = 'electronic_brand_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'electronic_models' AND column_name = 'brand_id'
    ) THEN
        ALTER TABLE electronic_models RENAME COLUMN electronic_brand_id TO brand_id;
    END IF;
END $$;

ALTER TABLE electronic_models
    ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES electronic_brands (id),
    ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES electronic_types (id),
    ADD COLUMN IF NOT EXISTS release_year INTEGER,
    ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS aliases TEXT;
