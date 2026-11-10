# Real Estate Catalog UI Module

Property and real estate listings, geographic coordinates mapping, room configurations, and building specifications.

## Architecture

- **`realEstateService`:** API service managing real estate listing lifecycles:
  - `createListing(data)`: Dispatches property listing payloads (`POST /v1/real-estates/create-listing`).
  - `getListing(id)`: Retrieves property specifications (`GET /v1/real-estates/{id}`).
  - `updateListing(id, data)`: Updates property listings (`PUT /v1/real-estates/{id}`).
- **`RealEstateMap`:** Interactive Leaflet map (`leaflet`) displaying pinpointed property location, neighborhood boundaries, and coordinate picking in create/edit modes.
- **`realEstateAttributeQuery`:** React Query hook fetching attribute definitions from `/v1/catalog/real-estate/attributes`.
- **`realEstateRules.js` & `realEstates.js`:** Validation rules and schema defaults for square meters (gross vs net), room count codes (`2+1`, `3+1`), floor level, total floors, building age, and heating systems.

## Invariants

- **Area Invariant:** Net square meters must not exceed gross square meters in form validations.
- **Map Cleanup:** Leaflet map instances and tile layers are destroyed cleanly on component unmount to prevent canvas memory leaks.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean architectural spec cards, subtle map controls, and zero emojis.

