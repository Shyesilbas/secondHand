# SecondHand Frontend

## Purpose
The `secondhand-frontend` module is the React-based Single Page Application (SPA) providing the user interface for the SecondHand platform.

## Architecture Overview
- **Routing**: Client-side routing managed by React Router.
- **Data Fetching & State**: Managed entirely by `@tanstack/react-query`.
- **API Communication**: Centralized through `services/api/request.js` using Axios.

## Responsibilities
- Rendering responsive, accessible user interfaces.
- Orchestrating client-side interactions and transitions.
- Handling local authentication state synchronization via token interceptors.

## Invariants & Constraints
- **State Ownership**: Server state is strictly owned by React Query. Local state must not duplicate server data.
- **API Uniformity**: All API calls MUST use the centralized `services/api/request.js`.
- **Notification Consistency**: Global alerts must utilize the `NotificationContext`. Use of native `alert()` or `confirm()` is prohibited.

## Integration Points
- **Backend API**: Connects to the backend REST services.
- **Authentication**: Token refresh via `services/api/interceptors.js`.

## Knowledge Routing
- For UI components, forms, and general architectural guidelines, refer to the intent-routed KIs in `src/.docs/`.

## Source of Truth
- **Business Rules:** Domain READMEs
- **UI Rules:** Frontend UX KIs (`src/.docs/`)
- **React Query:** `react-query-ownership.md`
- **API:** Backend OpenAPI & Tests
- **Validated Behaviour:** Unit Tests
- **Architecture:** `GEMINI.md`
