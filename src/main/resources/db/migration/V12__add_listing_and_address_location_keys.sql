-- V12: Add city_key, district_key, and neighborhood_key columns to listings and addresses tables

ALTER TABLE listings ADD COLUMN city_key VARCHAR(60);
ALTER TABLE listings ADD COLUMN district_key VARCHAR(60);
ALTER TABLE listings ADD COLUMN neighborhood_key VARCHAR(60);

ALTER TABLE addresses ADD COLUMN city_key VARCHAR(60);
ALTER TABLE addresses ADD COLUMN district_key VARCHAR(60);
ALTER TABLE addresses ADD COLUMN neighborhood_key VARCHAR(60);

-- Indexes for geofiltering performance
CREATE INDEX idx_listings_location_keys ON listings(city_key, district_key, neighborhood_key);
CREATE INDEX idx_addresses_location_keys ON addresses(city_key, district_key, neighborhood_key);
