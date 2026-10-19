-- ─── Book and Sport Catalog Columns ──────────────────────────────────────────

-- Books
ALTER TABLE book_types ADD COLUMN IF NOT EXISTS label VARCHAR(160);
ALTER TABLE book_genres ADD COLUMN IF NOT EXISTS label VARCHAR(200);
ALTER TABLE book_genres ADD COLUMN IF NOT EXISTS book_type_id UUID REFERENCES book_types (id);
ALTER TABLE book_languages ADD COLUMN IF NOT EXISTS label VARCHAR(160);
ALTER TABLE book_formats ADD COLUMN IF NOT EXISTS label VARCHAR(160);
ALTER TABLE book_conditions ADD COLUMN IF NOT EXISTS label VARCHAR(160);

-- Sports
ALTER TABLE sport_disciplines ADD COLUMN IF NOT EXISTS label VARCHAR(120);
ALTER TABLE sport_equipment_types ADD COLUMN IF NOT EXISTS label VARCHAR(120);
ALTER TABLE sport_equipment_types ADD COLUMN IF NOT EXISTS discipline_id UUID REFERENCES sport_disciplines (id);
ALTER TABLE sport_conditions ADD COLUMN IF NOT EXISTS label VARCHAR(120);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_book_genres_book_type_id ON book_genres (book_type_id);
CREATE INDEX IF NOT EXISTS idx_sport_equipment_discipline_id ON sport_equipment_types (discipline_id);
