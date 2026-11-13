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

## 2. Comparison Matrix & Category Alignment

### 4-Item Capacity Ceiling
- A maximum of 4 listings can be compared simultaneously.
- Attempting to add a 5th item displays an alert toast: "You can compare up to 4 items at a time. Please remove an item first."

### Category-Aware Table Rows
- **General Fields (Shared):** Price, Location (City/District), Seller Rating, Publication Date, Delivery Method (Cargo vs Safe Meetup).
- **Vehicles:** Model Year, Mileage, Transmission, Fuel Type, Engine HP/CC, Damage Map Summary.
- **Electronics:** Brand, Model, Storage/RAM, Condition, Battery Health, Box/Invoice Status.
- **Real Estate:** Property Type, Gross/Net m², Room Count, Floor Number, Heating, Furnished.
- **Books:** Author, Publisher, Year, Page Count, Format, ISBN.
- **Clothing:** Brand, Size, Condition, Material, Target Audience.
- **Sports:** Discipline, Equipment Type, Condition, Dimensions/Weight.

## 3. Storage & Persistence Invariants
- Comparison items persist across page navigation and reloads using `localStorage` (`secondhand_comparison_items`).
- Stored payload keeps minimal identifiers (`id`, `title`, `price`, `imageUrl`, `category`) to avoid stale spec states.
