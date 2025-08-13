# SecondHand Frontend

## Architecture Overview

- src/
  - components/
    - forms/
      - ListingBasics.jsx
      - LocationFields.jsx
    - notifications/
      - NotificationModal.jsx
    - ui/
      - EnumDropdown.jsx
      - SearchableDropdown.jsx
  - features/
    - auth/ | emails/ | favorites/ | listings/ | payments/ | vehicles/ | users/
      - services/ → API calls (via services/api/request.js)
      - components/ → Feature-specific UI
      - hooks/ → Feature hooks
  - pages/ → Route pages
  - services/
    - api/
      - config.js → Axios base
      - interceptors.js → Token, retry
      - request.js → Shared request wrapper (get/post/put/del)
    - storage/
      - tokenStorage.js | enumCache.js
  - utils/
    - formatters.js → formatCurrency, formatDateTime
    - errorHandler.js → parse/notify helpers
    - validators/
      - vehicleValidators.js
  - context/
    - AuthContext.jsx
    - NotificationContext.jsx

## Conventions

- API calls MUST use `services/api/request.js` for consistency and logging.
- Use `EnumDropdown` for enum-based selections (carBrands, colors, fuelTypes, ...).
- Use shared form blocks: `ListingBasics` and `LocationFields` in create/edit flows.
- Display currency/dates via `formatters.js`.
- Use `NotificationContext` for all toasts, confirmations, and errors. Avoid alert/confirm.

## Token Refresh

- Interceptors are initialized in `src/main.jsx` by importing `services/api/interceptors.js`.
- 401/403 → refresh token automatically; retried with new access token.

## Development

- Start: `npm run dev`
- Build: `npm run build`

