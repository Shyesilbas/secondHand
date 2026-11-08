-- Vehicle types carry their own form/validation rules instead of code checking type names.
-- Values come from data/vehicles/types.json (vehicle seed); see listing/README.md ("Vehicle types").

-- Display order of the type picker.
ALTER TABLE vehicle_types ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Body types a listing of this type may use (BodyType enum names).
ALTER TABLE vehicle_types ADD COLUMN body_types JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Spec field -> REQUIRED | OPTIONAL | HIDDEN; a field the map does not name is HIDDEN.
ALTER TABLE vehicle_types ADD COLUMN field_rules JSONB NOT NULL DEFAULT '{}'::jsonb;
