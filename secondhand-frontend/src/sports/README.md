# Sports Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `sports` module handles sporting equipment, fitness machinery, bicycles, water sports, winter sports, and outdoor gear across 8 primary athletic disciplines:
- **`CYCLING`** (Bisiklet & Aksesuarları: Yol, Dağ, Şehir, Elektrikli)
- **`FITNESS`** (Kondisyon & Ağırlık: Koşu Bandı, Dambıl, Ağırlık Sehpası)
- **`CAMPING_OUTDOOR`** (Kamp & Doğa: Çadır, Uyku Tulumu, Sırt Çantası)
- **`WATER_SPORTS`** (Su Sporları: Sörf, Dalış, Kano)
- **`WINTER_SPORTS`** (Kış Sporları: Kayak, Snowboard, Kızak)
- **`RACKET_SPORTS`** (Raket Sporları: Tenis, Padel, Masa Tenisi, Badminton)
- **`TEAM_SPORTS`** (Takım Sporları: Futbol, Basketbol, Voleybol)
- **`RUNNING`** (Koşu & Yürüyüş)

---

## 2. Component Hierarchy & File Structure

```
src/sports/
├── services/
│   └── sportsService.js                # Raw Axios API calls (/api/v1/sports/**)
├── sports.js                           # Form schemas, validation rules, initial field states
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['catalog', 'sports', 'disciplines']`: Athletic disciplines (`/api/v1/enums/all`).
- `['catalog', 'sports', 'equipmentTypes', disciplineId]`: Equipment categories narrowed by discipline.
- `['catalog', 'sports', 'conditions']`: Standard gear condition grades.
- `['sports', 'detail', id]`: Full technical specifications and condition metrics.

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createSportsListing` | `POST /api/v1/sports/create-listing` | `['listings', 'my']`, `['listings', 'search']` | Creates draft/active sports item |
| `updateSportsListing` | `PUT /api/v1/sports/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Updates technical specs and condition |

---

## 4. Discipline & Equipment Type Cascades

1. **Discipline Selection:** The user first selects the athletic discipline (e.g. `CYCLING` or `CAMPING_OUTDOOR`).
2. **Equipment Type Cascade:**
   - Selecting `CYCLING` dynamically populates equipment types: Road Bike, Mountain Bike, Gravel, City Bike, E-Bike, Helmet, Cycling Shoes.
   - Selecting `WINTER_SPORTS` populates: Alpine Skis, Snowboard, Ski Boots, Bindings, Goggles.
3. **Condition Tiers:** `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`.

---

## 5. Form & Technical Invariants

1. **Bicycle Sizing:** Frame sizes (e.g. 52 cm, 54 cm, 56 cm or S, M, L) and wheel dimensions (e.g. 26", 27.5", 29", 700c) are captured as structured attributes.
2. **Weight & Dimensions:** Heavy fitness equipment (treadmills, squat racks) capture weight in kilograms for logistics planning.
3. **Safety Gear Rule:** Helmets and climbing harnesses require confirmation that the item has suffered no structural impact.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `SPORTS_EQUIPMENT_TYPE_REQUIRED` -> "Please select an equipment type for this sport discipline."
  - `SPORTS_CONDITION_REQUIRED` -> "Please select the condition of the sports gear."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** Gear dimensions, frame sizes, and weights use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across sport category pills, condition tags, and filters.
- **Radius Ceiling:** Cards, discipline buttons, and spec tables adhere strictly to `rounded-md`.
