# Clothing Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `clothing` module manages fashion, footwear, and accessory listings across 59 distinct garment categories grouped into 3 overarching departments:
- **`APPAREL`** (Giyim: Üst Giyim, Alt Giyim, Dış Giyim, Elbise, Takım Elbise)
- **`FOOTWEAR`** (Ayakkabı: Spor Ayakkabı, Bot, Çizme, Topuklu, Sandalet)
- **`ACCESSORY`** (Aksesuar: Çanta, Kemer, Şapka, Atkı, Güneş Gözlüğü)

It features audience-driven size system adaptation, mandatory defect disclosure for flawed items, and garment measurement attributes.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['catalog', 'clothing', 'attributes', String(typeId ?? '')]` | `clothingAttributeQuery.js` |

## 3. Size Systems & Audience Cascades

### Shared Size Systems (`data/common/sizes.json`)
The form dynamically offers size values based on the target `audience` and garment `group`:
- **`LETTER`:** XXS, XS, S, M, L, XL, XXL, 3XL
- **`WOMEN_NUMERIC`:** 32, 34, 36, 38, 40, 42, 44, 46, 48
- **`MEN_NUMERIC`:** 44, 46, 48, 50, 52, 54, 56, 58
- **`JEANS`:** W28_L30 through W38_L34
- **`SHOE_EU`:** 35 through 48
- **`KIDS_SHOE_EU`:** 16 through 35
- **`KIDS_AGE`:** 2Y, 3Y, 4Y, 5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y
- **`BABY_MONTHS`:** 0-3M, 3-6M, 6-9M, 9-12M, 12-18M, 18-24M
- **`ONE_SIZE`:** Standard accessories and bags

### Audience Restrictions
- Audiences: `WOMEN`, `MEN`, `UNISEX`, `GIRL`, `BOY`, `BABY`.
- A garment type restricts which audiences it accepts (e.g. Dresses are not offered for MEN).
- Selecting an audience immediately narrows the allowed size systems.

## 4. Form & Defect Disclosure Invariants

1. **Condition Tiers:** `NEW_WITH_TAGS`, `NEW_WITHOUT_TAGS`, `VERY_GOOD`, `GOOD`, `FLAWED`.
2. **Mandatory Defect Disclosure:**
   - If the seller selects condition `FLAWED`, the form requires selecting at least one item from the `defects` attribute array (Stain, Tear, Missing Button, Broken Zipper, Pilling, Altered).
3. **Garment Measurements (Apparel):**
   - Optional detailed tailoring measurements in centimeters (`chestCm`, `waistCm`, `lengthCm`, `inseamCm`) stored in `attributes`.
4. **Underwear & Swimwear Rule:**
   - Underwear, socks, and swimwear are restricted to `NEW_WITH_TAGS` condition only.
