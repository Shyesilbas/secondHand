# Electronics Catalog UI Module

Consumer electronics, computers, smartphones, and appliance listing attributes and filter rules.

## Architecture

- **`electronicService`:** API service managing consumer electronics listings:
  - `createListing(data)`: Dispatches electronic listing payloads (`POST /v1/electronics/create-listing`).
  - `getListing(id)`: Retrieves extended device specifications (`GET /v1/electronics/{id}`).
  - `updateListing(id, data)`: Updates electronic listings (`PUT /v1/electronics/{id}`).
- **`electronicAttributeQuery`:** React Query hook fetching dynamic attribute definitions and rule configurations from `/v1/catalog/electronics/attributes`.
- **`electronicCatalogUtils.js`:** Utilities formatting technical specifications (RAM, storage capacity, battery health percentage, warranty duration, device condition).
- **`electronics.js`:** State templates and field validation schemas for electronics forms.

## Invariants

- **Type-Specific Attributes:** Switching the electronic type (e.g., from Phone to Laptop) resets incompatible technical attributes and loads relevant definitions.
- **Battery Health Boundaries:** Battery health inputs validate strictly between 1% and 100%.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clear technical spec grids, subtle condition pills, and zero emojis.

