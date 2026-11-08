-- Listings created by the dev-only listing generator (seed key `listings-generate`), so they can be told apart
-- and removed again (`listings-clean`). Real listings never get a row here.
CREATE TABLE generated_listings (
    listing_id   UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    batch        VARCHAR(40)  NOT NULL,
    generated_at TIMESTAMP    NOT NULL DEFAULT now()
);
