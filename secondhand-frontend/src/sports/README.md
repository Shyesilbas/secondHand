# Sports Catalog UI Module

Sporting equipment, outdoor gear, fitness hardware, and recreational activity listings.

## Architecture

- **`sportsService`:** API service managing sports and outdoor listings:
  - `createListing(data)`: Dispatches sporting equipment payloads (`POST /v1/sports/create-listing`).
  - `getListing(id)`: Retrieves extended sports equipment specifications (`GET /v1/sports/{id}`).
  - `updateListing(id, data)`: Updates sports listings (`PUT /v1/sports/{id}`).
- **`sports.js`:** State templates and field validation schemas for sporting goods, fitness machinery, bicycles, and outdoor gear.

## Invariants

- **Condition Assessment:** Equipment condition options (New, Like New, Good, Fair) enforce clear visual descriptions and accurate wear indicators.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean technical specification cards, neutral equipment property lists, and zero emojis.

