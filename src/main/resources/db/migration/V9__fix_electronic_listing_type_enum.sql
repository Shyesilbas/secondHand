-- Fix invalid enum constant ELECTRONIC -> ELECTRONICS in listings table
UPDATE listings
SET listing_type = 'ELECTRONICS'
WHERE listing_type = 'ELECTRONIC';
