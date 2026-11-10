# Comparison UI Module

Cross-listing comparison matrix, floating drawer, and vertical-specific attribute alignment.

## Architecture

- **`ComparisonProvider` & `ComparisonContext`:** React context provider managing comparison state across the application. Caps comparison capacity at 4 listings simultaneously.
- **`CompareFloatingBar`:** Persistent dock pinned to the bottom of the viewport when one or more items are selected, providing quick removal and modal launch actions.
- **`CompareModal`:** Full comparison modal rendering listings side-by-side across pricing, seller information, and technical specifications.
- **`comparisonFieldsConfig.js`:** Field matrix mapping listing properties and vertical attributes (vehicles, electronics, real estate, books, clothing, sports) to aligned comparison table rows.
- **`CompareButton`:** Standard button placed on listing cards and detail hero views to toggle comparison inclusion.

## Invariants

- **Maximum Capacity Ceiling:** Attempts to add more than 4 listings trigger notification alerts and block insertion until an existing item is removed.
- **Vertical Compatibility:** Comparison dynamically handles heterogeneous listing types by grouping shared attributes and rendering vertical-specific attributes conditionally.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean table borders, fixed column widths, sticky floating docks, and zero emojis.

