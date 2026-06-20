ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check CHECK (status::text = ANY (ARRAY['ACTIVE'::character varying::text, 'RESERVED'::character varying::text, 'INACTIVE'::character varying::text, 'DRAFT'::character varying::text, 'SOLD'::character varying::text, 'DELETED'::character varying::text]));
