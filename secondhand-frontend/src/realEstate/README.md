# Real Estate Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `realEstate` module handles property listings across 4 primary property categories:
- **`RESIDENTIAL`** (Konut: Daire, Villa, Müstakil Ev, Yazlık)
- **`LAND`** (Arsa & Tarla)
- **`COMMERCIAL`** (İş Yeri: Ofis, Dükkan, Depo)
- **`OTHER`** (Diğer Gayrimenkul)

It features approximate-area Leaflet map integration, gross/net square meter validation, and dynamic lease/sale field rules.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['catalog', 'real-estate', 'attributes', String(typeId ?? '')]` | `realEstateAttributeQuery.js` |

## 3. Privacy-Preserving Map Architecture (`RealEstateMap`)

### Approximate Location Circle
- To protect seller privacy and physical property security, exact street addresses and building numbers are **never** displayed to prospective buyers.
- The backend assigns a randomized location offset 100-300 meters from the neighborhood center.
- `<RealEstateMap>` renders an approximate circle overlay (radius 200m) centered on these coordinates using Leaflet with OpenStreetMap tiles.
- If a neighborhood lacks geographic coordinates, the map section collapses cleanly.

## 4. Form & Specification Invariants

1. **Ad Types (`ad_type`):** Strictly limited to `FOR_SALE` (Satılık) or `FOR_RENT` (Kiralık).
2. **Deposit & Lease Restrictions:** Deposit (`deposit`) and minimum lease duration (`minLeaseMonths`) are strictly visible and editable only when `ad_type === 'FOR_RENT'`.
3. **Loan Eligibility:** Loan eligibility (`loanEligible`) is applicable only when `ad_type === 'FOR_SALE'`.
4. **Area Consistency:** Net square meters must be strictly less than or equal to gross square meters (`netAreaM2 <= grossAreaM2`).
5. **Floor Bounding:** Current floor number cannot exceed total building floors (`floorNumber <= totalFloors`).
6. **Derived Attributes:** Room counts and floor numbers are derived from canonical enum keys (`roomConfigKey`, `floorKey`).
