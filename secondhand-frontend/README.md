# SecondHand Frontend

React SPA for the SecondHand platform. Conventions and design rules: `AGENTS.md` and `DESIGN.md`.

## Architecture
- Routing: React Router.
- Server state: `@tanstack/react-query` only; local state never duplicates server data.
- API: all calls go through `common/services/api/request.js` (Axios); token refresh in `common/services/api/interceptors.js`.
- Global messages use `NotificationContext`; native `alert()` / `confirm()` are not allowed.

## Source of truth
Business rules: backend module READMEs. API: `secondhand-openapi.json`. Behavior: tests.
