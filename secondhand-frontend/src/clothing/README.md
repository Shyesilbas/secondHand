# Clothing Catalog UI Module

Apparel, footwear, fashion accessories, size systems, and fabric material specifications.

## Architecture

- **`clothingService`:** API service managing clothing listing lifecycles:
  - `createListing(data)`: Dispatches apparel listing payloads (`POST /v1/clothing/create-listing`).
  - `getListing(id)`: Retrieves clothing specifications (`GET /v1/clothing/{id}`).
  - `updateListing(id, data)`: Updates apparel listings (`PUT /v1/clothing/{id}`).
- **`clothingAttributeQuery`:** React Query hook querying dynamic attribute definitions from `/v1/catalog/clothing/attributes`.
- **`clothingCatalogUtils.js`:** Utilities formatting size standards (EU, US, UK, numerical shoe sizes), gender categories (men, women, unisex, kids), fabric materials, and color swatches.
- **`clothing.js`:** State templates and form validation schemas for clothing listings.

## Invariants

- **Size System Mapping:** Size selectors dynamically adapt options based on the chosen sub-category (shoes vs tops vs bottoms).
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: subtle color pills, clean size chips, hairline dividers, and zero emojis.

