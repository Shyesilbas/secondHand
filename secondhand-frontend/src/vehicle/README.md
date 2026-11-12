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

---

## 2. Component Hierarchy & File Structure

```
src/vehicle/
├── services/
│   ├── vehicleService.js               # API service (/api/v1/vehicles/**)
│   └── vehicleAttributeQuery.js        # React Query hook for dynamic vehicle attributes
├── utils/
│   └── vehicleCatalogUtils.js          # Formatters for mileage, displacement, and brand/model cascades
├── vehicles.js                         # Form validation, initial form values, spec field mappings
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['catalog', 'vehicle', 'types']`: Base vehicle types (`/api/v1/catalog/vehicle/types`).
- `['catalog', 'vehicle', 'brands', typeId]`: Brands filtered by selected vehicle type.
- `['catalog', 'vehicle', 'models', brandId, typeId]`: Models filtered by brand and type.
- `['catalog', 'vehicle', 'generations', modelId, year]`: Generations filtered by model and year.
- `['catalog', 'vehicle', 'versions', generationId, year]`: Specific engine, gearbox, and drivetrain versions.
- `['catalog', 'vehicle', 'trims', generationId]`: Equipment packages.
- `['catalog', 'vehicle', 'attributes', typeName]`: Dynamic type-scoped attribute definitions (tramer, axle config, payload).

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createVehicleListing` | `POST /api/v1/vehicles/create-listing` | `['listings', 'my']`, `['listings', 'search']` | Creates draft/active vehicle item |
| `updateVehicleListing` | `PUT /api/v1/vehicles/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Refreshes specs and damage records |

---

## 4. Hierarchy Cascades & Spec Snapshotting

### 4.1 6-Level Hierarchy Selection
1. **Vehicle Type Selection:** Determines allowed `bodyTypes` and applies field rules (`REQUIRED`, `OPTIONAL`, `HIDDEN`) for engine CC, HP, doors, and fuel type.
2. **Brand -> Model -> Generation Cascade:** Filters options dynamically based on prior selections without reload.
3. **Version Selection (`vehicleVersionId`):**
   - Selecting a verified catalog version automatically populates verified horsepower, torque, fuel type, transmission, and drivetrain specs.
   - Values become read-only verified specs; seller cannot falsely claim conflicting values.
   - If no catalog version is selected, specs remain seller-declared (unverified).

### 4.2 Interactive Damage Mapping (`DamageMapField`)
- Vehicle forms integrate `<DamageMapField>`, rendering an interactive blueprint of a vehicle with 13 discrete body panels (Hood, Roof, Front Bumper, Rear Bumper, Doors, Fenders, Tailgate).
- Each panel records an atomic condition state: `ORIGINAL`, `PAINTED`, `LOCAL_PAINTED`, or `REPLACED`.
- Serializes as an `ENUM_MAP` attribute within `formData.attributes` sent to PostgreSQL JSONB.

---

## 5. Form & Filter Invariants

1. **Model Year Bounding:** Model year must fall strictly within the generation's production window (`year >= minYear && year <= maxYear`).
2. **Mileage Formatting:** Mileage inputs use integer parsing with localized thousands separators (e.g. `145.000 km`).
3. **Hidden Fields Suppression:** Fields marked `HIDDEN` for the chosen type (e.g. doors for motorcycles) are cleared and omitted from submission payloads.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions parsed via `errorUtils.getErrorMessage(err)`:
  - `VEHICLE_VERSION_MISMATCH` -> "The selected engine version does not belong to this vehicle generation."
  - `VEHICLE_YEAR_INVALID` -> "Model year is outside the production period for this vehicle model."
  - `VEHICLE_MILEAGE_NEGATIVE` -> "Mileage must be a positive number."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Kilometer, horsepower, and torque use `font-mono tabular-nums`.
- **Damage Legend:** Uses subdued semantic indicators (Green for Original, Amber for Painted, Red for Replaced).
- **Zero Emojis:** Strictly prohibited across vehicle specs, damage summaries, and badges.
- **Radius Ceiling:** Damage map containers, inputs, and specification tables adhere to `rounded-md`.
