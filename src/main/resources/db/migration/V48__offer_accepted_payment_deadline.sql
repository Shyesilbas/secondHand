-- ACCEPTED offers now expire at a payment deadline stored in expires_at (app.offer.accepted-payment-hours).
-- Until now expires_at still held the old response deadline, so without this backfill every accepted offer
-- older than that deadline would expire on the first scheduler run. Give each one 24 hours from acceptance.
UPDATE offers
SET expires_at = COALESCE(updated_at, created_at, now()) + INTERVAL '24 hours'
WHERE status = 'ACCEPTED';
