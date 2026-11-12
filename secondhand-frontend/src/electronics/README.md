# Electronics Catalog UI Module

## 1. Executive Summary & Catalog Scope
The `electronics` module manages listing creation, catalog hardware snapshotting, official color pickers, and condition questionnaires across 19 consumer technology categories (Smartphones, Laptops, Tablets, Smartwatches, Gaming Consoles, Headphones, Cameras, Televisions, Monitors, Audio Systems, PC Components).

---

## 2. Component Hierarchy & File Structure

```
src/electronics/
├── services/
│   ├── electronicService.js            # Raw Axios calls (/api/v1/electronics/**)
│   └── electronicAttributeQuery.js     # React Query hook for dynamic electronic attributes
├── utils/
│   └── electronicCatalogUtils.js       # Formatters for storage (GB/TB), RAM, battery health, chipset
├── electronics.js                      # Form schemas, validation rules, initial field states
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['catalog', 'electronics', 'types']`: Active electronic types (`/api/v1/enums/all`).
- `['catalog', 'electronics', 'brands', typeId]`: Brands supporting the selected type.
- `['catalog', 'electronics', 'models', brandId, typeId]`: Canonical device models.
- `['catalog', 'electronics', 'modelDetail', modelId]`: Hardware specs, official color palette, storage variants.
- `['catalog', 'electronics', 'attributes', typeId]`: Dynamic condition attributes (battery health, IMEI, box).

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createElectronicListing` | `POST /api/v1/electronics/create-listing` | `['listings', 'my']`, `['listings', 'search']` | Creates draft/active electronics item |
| `updateElectronicListing` | `PUT /api/v1/electronics/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Refreshes specs and condition data |

---

## 4. Hardware Snapshotting & Official Colors

### 4.1 Canonical Model & Variant Binding
1. **Model Selection:** When a seller selects an official model (e.g. "Apple iPhone 15 Pro"):
   - Hardware specs (Chipset, Display, Camera MP, Battery mAh, IP rating) are fetched and rendered read-only.
   - The form populates official factory color swatches (`officialColors: [{ name: "Natural Titanium", color: "GRAY" }]`).
2. **Variant Selection (`variantId`):**
   - Seller selects the exact storage/RAM variant (e.g. "256 GB / 8 GB RAM").
   - Specifications snapshot into the listing payload, preventing fraudulent hardware misrepresentation.

### 4.2 Dynamic Condition Attributes
Stored within `listings.attributes` JSONB:
- **Smartphones / Tablets:** Battery health percentage (1-100%), replaced parts (screen, battery, camera), Face ID / Touch ID status, IMEI registration status, original box, purchase invoice, warranty end date.
- **Gaming Consoles:** Controller count, joystick drift, modded/jailbroken status, included cables, bundled games.
- **Headphones:** Battery condition, both sides working, charging case condition, ear pad wear.

---

## 5. Form & Filter Invariants

1. **Battery Health Bounding:** Battery health must be an integer between 1 and 100.
2. **Official Color Enforcement:** If the model defines official colors, the seller must choose from the official palette; custom text color names are disallowed.
3. **Storage & RAM Unit Consistency:** Displays use standard binary units (e.g. 128 GB, 256 GB, 1 TB).

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `ELECTRONIC_VARIANT_MODEL_MISMATCH` -> "The selected storage variant does not exist for this device model."
  - `ELECTRONIC_COLOR_NOT_IN_MODEL` -> "The chosen color is not an official factory color for this model."
  - `ELECTRONIC_BATTERY_HEALTH_INVALID` -> "Battery health percentage must be between 1 and 100."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Storage sizes, RAM, and battery percentages use `font-mono tabular-nums`.
- **Color Swatches:** Official colors render with subtle border rings (`ring-1 ring-border-subtle`).
- **Zero Emojis:** Strictly prohibited across device specs, condition questions, and badge tags.
- **Radius Ceiling:** Attribute cards, color swatches, and spec tables adhere strictly to `rounded-md`.
