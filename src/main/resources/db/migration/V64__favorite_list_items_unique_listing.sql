-- One row per listing per favorite list. The service checks first, but two concurrent adds could both insert;
-- the unique index lets the second insert fail (DataIntegrityViolationException -> ITEM_ALREADY_IN_LIST).
-- Keep the oldest row of any existing duplicates before adding the index.
DELETE FROM favorite_list_items a
USING favorite_list_items b
WHERE a.favorite_list_id = b.favorite_list_id
  AND a.listing_id = b.listing_id
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS uk_favorite_list_items_list_listing ON favorite_list_items (favorite_list_id, listing_id);
DROP INDEX IF EXISTS idx_favorite_list_items_list_listing;
