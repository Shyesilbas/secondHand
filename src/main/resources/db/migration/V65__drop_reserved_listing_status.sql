-- ListingStatus.RESERVED is removed: no code path ever set it (accepted offers hold stock in Redis instead).
-- Any row that still carries it would fail to load, so it goes back to ACTIVE.
UPDATE listings SET status = 'ACTIVE' WHERE status = 'RESERVED';
