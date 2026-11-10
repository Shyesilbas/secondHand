# Vehicle Catalog UI Module

Automotive and motorized vehicle listing specifications, catalog metadata, damage mapping, and filter rules.

## Architecture

- **`vehicleService`:** API service managing vehicle-specific listing mutations:
  - `createListing(data)`: Dispatches vehicle listing payloads (`POST /v1/vehicles/create-listing`).
  - `getListing(id)`: Retrieves extended vehicle specifications (`GET /v1/vehicles/{id}`).
  - `updateListing(id, data)`: Updates existing vehicle listings (`PUT /v1/vehicles/{id}`).
- **`vehicleAttributeQuery`:** React Query hook fetching dynamic attribute definitions and rule configurations from `/v1/catalog/vehicle/attributes`.
- **`vehicleCatalogUtils.js`:** Utility functions formatting vehicle attributes (year, mileage, transmission, fuel type, engine displacement, body style) and filtering brand/model hierarchies.
- **`vehicles.js`:** Initial state templates and validation schemas for vehicle creation and editing forms.

## Invariants

- **Damage Map Integrity:** Damage records (`ENUM_MAP`) are strictly mapped against predefined vehicle body parts (hood, roof, doors, fenders) without arbitrary custom keys.
- **Dynamic Field Rules:** Form inputs and search filters adapt dynamically according to the selected vehicle type's `fieldRules` returned from the catalog endpoint.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean tabular-nums for mileage and engine capacity, neutral specs tables, and zero decorative emojis.

