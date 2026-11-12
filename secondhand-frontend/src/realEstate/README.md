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

---

## 2. Component Hierarchy & File Structure

```
src/realEstate/
├── components/
│   └── RealEstateMap.jsx               # Privacy-preserving Leaflet map rendering an approximate circle
├── services/
│   ├── realEstateService.js            # Raw Axios calls (/api/v1/real-estates/**)
│   └── realEstateAttributeQuery.js     # React Query hook for dynamic real estate attributes
├── utils/
│   └── realEstateRules.js              # Spec field rules, floor derivation, room configuration helpers
├── realEstates.js                      # Form schemas, validation rules, initial field states
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['catalog', 'realEstate', 'types']`: Active property types (`/api/v1/enums/all`).
- `['catalog', 'realEstate', 'attributes', category]`: Dynamic category attributes (deed status, loan eligibility, facades).
- `['realEstate', 'detail', id]`: Full property specifications and coordinates.

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createRealEstateListing` | `POST /api/v1/real-estates/create-listing` | `['listings', 'my']`, `['listings', 'search']` | Creates draft/active property item |
| `updateRealEstateListing` | `PUT /api/v1/real-estates/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Updates areas, floors, and attributes |

---

## 4. Privacy-Preserving Map Architecture (`RealEstateMap`)

### 4.1 Approximate Location Circle
- To protect seller privacy and physical property security, exact street addresses and building numbers are **never** displayed to prospective buyers.
- The backend assigns a randomized location offset 100-300 meters from the neighborhood center.
- `<RealEstateMap>` renders an approximate circle overlay (radius 200m) centered on these coordinates using Leaflet with OpenStreetMap tiles.
- If a neighborhood lacks geographic coordinates, the map section collapses cleanly.

---

## 5. Form & Specification Invariants

1. **Ad Types (`ad_type`):** Strictly limited to `FOR_SALE` (Satılık) or `FOR_RENT` (Kiralık).
2. **Deposit & Lease Restrictions:** Deposit (`deposit`) and minimum lease duration (`minLeaseMonths`) are strictly visible and editable only when `ad_type === 'FOR_RENT'`.
3. **Loan Eligibility:** Loan eligibility (`loanEligible`) is applicable only when `ad_type === 'FOR_SALE'`.
4. **Area Consistency:** Net square meters must be strictly less than or equal to gross square meters (`netAreaM2 <= grossAreaM2`).
5. **Floor Bounding:** Current floor number cannot exceed total building floors (`floorNumber <= totalFloors`).
6. **Derived Attributes:** Room counts and floor numbers are derived from canonical enum keys (`roomConfigKey`, `floorKey`).

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `REAL_ESTATE_NET_AREA_ABOVE_GROSS` -> "Net area cannot be greater than gross area."
  - `REAL_ESTATE_FLOOR_ABOVE_TOTAL` -> "Floor number cannot exceed total building floors."
  - `REAL_ESTATE_PRICE_REQUIRED` -> "Property price is mandatory."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Gross m², net m², room count, and floor numbers use `font-mono tabular-nums`.
- **Map Container:** Bounded height (300px) with hairline border (`border border-border-subtle rounded-md`).
- **Zero Emojis:** Strictly prohibited across property features, room tags, and map markers.
- **Radius Ceiling:** Map cards, spec tables, and buttons adhere strictly to `rounded-md`.
