# Vehicle Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `vehicle` module governs automotive listing creation, catalog specification hierarchies, vehicle damage mapping, and spec-driven filters across 4 primary vehicle types:
- **`CAR`** (Otomobil)
- **`COMMERCIAL`** (Hafif Ticari)
- **`TRUCK`** (Ağır Vasıta)
- **`MOTORCYCLE`** (Motosiklet)
*(Note: Bicycles and electric scooters are managed under the Sports vertical).*

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['catalog', 'vehicle', 'attributes', String(typeId ?? '')]` | `vehicleAttributeQuery.js` |

## 3. Hierarchy Cascades & Spec Snapshotting

### 6-Level Hierarchy Selection
1. **Vehicle Type Selection:** Determines allowed `bodyTypes` and applies field rules (`REQUIRED`, `OPTIONAL`, `HIDDEN`) for engine CC, HP, doors, and fuel type.
2. **Brand -> Model -> Generation Cascade:** Filters options dynamically based on prior selections without reload.
3. **Version Selection (`vehicleVersionId`):**
   - Selecting a verified catalog version automatically populates verified horsepower, torque, fuel type, transmission, and drivetrain specs.
   - Values become read-only verified specs; seller cannot falsely claim conflicting values.
   - If no catalog version is selected, specs remain seller-declared (unverified).

### Interactive Damage Mapping (`DamageMapField`)
- Vehicle forms integrate `<DamageMapField>`, rendering an interactive blueprint of a vehicle with 13 discrete body panels (Hood, Roof, Front Bumper, Rear Bumper, Doors, Fenders, Tailgate).
- Each panel records an atomic condition state: `ORIGINAL`, `PAINTED`, `LOCAL_PAINTED`, or `REPLACED`.
- Serializes as an `ENUM_MAP` attribute within `formData.attributes` sent to PostgreSQL JSONB.

## 4. Form & Filter Invariants

1. **Model Year Bounding:** Model year must fall strictly within the generation's production window (`year >= minYear && year <= maxYear`).
2. **Mileage Formatting:** Mileage inputs use integer parsing with localized thousands separators (e.g. `145.000 km`).
3. **Hidden Fields Suppression:** Fields marked `HIDDEN` for the chosen type (e.g. doors for motorcycles) are cleared and omitted from submission payloads.
