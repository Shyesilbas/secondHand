# Electronics Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `electronics` module manages listing creation, catalog hardware snapshotting, official color pickers, and condition questionnaires across 19 consumer technology categories (Smartphones, Laptops, Tablets, Smartwatches, Gaming Consoles, Headphones, Cameras, Televisions, Monitors, Audio Systems, PC Components).

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['catalog', 'electronics', 'attributes', String(typeId ?? '')]` | `electronicAttributeQuery.js` |

## 3. Hardware Snapshotting & Official Colors

### Canonical Model & Variant Binding
1. **Model Selection:** When a seller selects an official model (e.g. "Apple iPhone 15 Pro"):
   - Hardware specs (Chipset, Display, Camera MP, Battery mAh, IP rating) are fetched and rendered read-only.
   - The form populates official factory color swatches (`colorsOf` in `electronicsConfig.js`; the official name goes to `colorName`, the generic `color` enum stays required).
2. **Variant Selection (`variantId`):**
   - Seller selects the exact storage/RAM variant (e.g. "256 GB / 8 GB RAM").
   - Specifications snapshot into the listing payload, preventing fraudulent hardware misrepresentation.

### Dynamic Condition Attributes
Stored within `listings.attributes` JSONB:
- **Smartphones / Tablets:** Battery health percentage (1-100%), replaced parts (screen, battery, camera), Face ID / Touch ID status, IMEI registration status, original box, purchase invoice, warranty end date.
- **Gaming Consoles:** Controller count, joystick drift, modded/jailbroken status, included cables, bundled games.
- **Headphones:** Battery condition, both sides working, charging case condition, ear pad wear.

## 4. Form & Filter Invariants

1. **Battery Health Bounding:** Battery health must be an integer between 1 and 100.
2. **Official Color Enforcement:** If the model defines official colors, the seller must choose from the official palette; custom text color names are disallowed.
3. **Storage & RAM Unit Consistency:** Displays use standard binary units (e.g. 128 GB, 256 GB, 1 TB).
