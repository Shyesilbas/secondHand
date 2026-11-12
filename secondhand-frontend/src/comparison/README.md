# Comparison UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Architecture
The `comparison` module allows shoppers to benchmark multiple listings side-by-side across pricing, specifications, seller reputations, and category-specific attributes.

### Key Architectural Responsibilities
- **Global Context (`ComparisonProvider`):** Manages comparison state across routes via `ComparisonContext`.
- **Persistent Floating Dock (`CompareFloatingBar`):** Pinned to the bottom viewport whenever 1 to 4 listings are selected, displaying thumbnails and a "Compare" trigger.
- **Side-by-Side Matrix (`CompareModal`):** Aligns listing data in fixed-width tabular columns highlighting spec discrepancies.
- **Dynamic Field Mapping (`comparisonFieldsConfig.js`):** Aligns heterogeneous specs across all 6 categories (Vehicles, Electronics, Real Estate, Books, Clothing, Sports).

---

## 2. Component Hierarchy & File Structure

```
src/comparison/
├── contexts/
│   ├── ComparisonContext.jsx           # React context exposing items, addItem, removeItem, clearAll
│   └── ComparisonProvider.jsx          # Context provider with localStorage synchronization
├── components/
│   ├── CompareButton.jsx               # Reusable toggle button on listing cards and detail pages
│   ├── CompareFloatingBar.jsx          # Fixed bottom dock with thumbnails and launch button
│   └── CompareModal.jsx                # Full-screen side-by-side comparison matrix dialog
├── hooks/
│   └── useComparison.js                # Convenience consumer hook for ComparisonContext
├── config/
│   └── comparisonFieldsConfig.js       # Field matrix mapping listing properties per vertical
└── README.md                           # Module documentation
```

---

## 3. Comparison Matrix & Category Alignment

### 3.1 4-Item Capacity Ceiling
- A maximum of 4 listings can be compared simultaneously.
- Attempting to add a 5th item displays an alert toast: "You can compare up to 4 items at a time. Please remove an item first."

### 3.2 Category-Aware Table Rows
- **General Fields (Shared):** Price, Location (City/District), Seller Rating, Publication Date, Delivery Method (Cargo vs Safe Meetup).
- **Vehicles:** Model Year, Mileage, Transmission, Fuel Type, Engine HP/CC, Damage Map Summary.
- **Electronics:** Brand, Model, Storage/RAM, Condition, Battery Health, Box/Invoice Status.
- **Real Estate:** Property Type, Gross/Net m², Room Count, Floor Number, Heating, Furnished.
- **Books:** Author, Publisher, Year, Page Count, Format, ISBN.
- **Clothing:** Brand, Size, Condition, Material, Target Audience.
- **Sports:** Discipline, Equipment Type, Condition, Dimensions/Weight.

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - Table columns display skeleton placeholder lines while deep listing details are resolved.
2. **Empty State:**
   - `CompareFloatingBar` remains hidden when `comparisonList.length === 0`.
   - `CompareModal` shows an empty state if all items are cleared inside the dialog.
3. **Error State:**
   - Soft notification alert if a selected listing has been deleted or deactivated in the background.
4. **Disabled / Submitting State:**
   - "Compare" button on the floating bar is disabled when only 1 item is selected (minimum 2 items required for comparison).

---

## 5. Storage & Persistence Invariants
- Comparison items persist across page navigation and reloads using `localStorage` (`secondhand_comparison_items`).
- Stored payload keeps minimal identifiers (`id`, `title`, `price`, `imageUrl`, `category`) to avoid stale spec states.

---

## 6. Restrained Design Tokens & Anti-Patterns
- **Dock Positioning:** Fixed bottom center (`bottom-4 left-1/2 -translate-x-1/2 z-40`).
- **Typography:** Prices and metrics use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across comparison buttons, spec labels, and dock pills.
- **Radius Ceiling:** Dock container, thumbnails, modal dialog, and buttons adhere strictly to `rounded-md`.
