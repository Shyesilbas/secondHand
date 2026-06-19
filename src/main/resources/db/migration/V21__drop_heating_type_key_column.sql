-- =============================================================================
-- V21: Remove redundant heating_type_key column from real_estate_listings
--
-- Context:
--   real_estate_listings previously had two parallel representations of the
--   heating type:
--     1. heating_type_id (FK → heating_types.id)  — used for filterable lookups
--     2. heating_type_key (VARCHAR)               — legacy in-memory catalog key
--        with a different key vocabulary (e.g. NATURAL_GAS_COMBI vs COMBI_BOILER)
--
--   The two systems were never kept in sync and served conflicting data.
--   After V20 migrated heating_types to deterministic UUIDs, the FK-based
--   approach is the single source of truth.  This migration drops the orphaned
--   column.
-- =============================================================================

ALTER TABLE real_estate_listings DROP COLUMN IF EXISTS heating_type_key;
