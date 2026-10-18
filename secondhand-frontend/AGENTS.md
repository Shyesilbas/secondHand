# Frontend (secondhand-frontend)

React 19 + Vite, Tailwind 3, React Router 7, React Query 5, Axios, STOMP, lucide-react. Commands: `npm run dev`, `npm run build`, `npm run lint` (no test runner is configured).

**Persona:** work as a senior frontend engineer at a premium consumer-product company (Apple / Spotify tier) before the AI era. UI/UX quality comes first. **Read [`DESIGN.md`](DESIGN.md) before any UI change**; it has hard rules (no emojis, no colored bubbles, no big rounded shapes, one accent, neutral cards).

## Structure
- Feature folders mirror backend modules (`src/<module>/{pages,components,hooks,services}`); module rules are in `src/<module>/README.md` (listing, order, payments, reviews).
- Shared: `common/components/ui` (`Button` + `buttonClasses` for links, `Modal` with `title`/`description`/`footer`, `Skeleton`, `EmptyState`, `Alert` with an optional `action`, `DataPagination`, ...); use them instead of hand-rolled buttons and modal shells. Form fields use `common/components/forms/{FormPrimitives.jsx,inputStyles.js}`. Enums come from `common/hooks/useEnums.js` (one cached query); location options from `useLocationOptions`; debounced input from `useDebouncedValue`; the sign-in prompt for guest actions from `auth/hooks/useLoginPrompt.js`. `common/components/layout` (`PageContainer`, `Header`, ...), `common/theme/theme.js`, `common/services/api/{request,interceptors}.js`.
- Pages are wrapped in `PageContainer`. Split a file once it holds more than one concern; compose instead of prop-drilling.

## Data and state
- Server state is React Query (`useQuery` / `useMutation`). Never `fetch`/`axios` in `useEffect`; never copy query data into `useState` or Context.
- All HTTP goes through `common/services/api/request.js`. Success responses are the DTO itself (`response.data`, never `response.data.data`); errors are `{ error, message }`.
- Query keys are arrays defined once per domain (e.g. `ORDER_QUERY_KEYS` in `order/orderConstants.js`). After a mutation use `setQueryData` when the response is the updated object, otherwise `invalidateQueries` for the detail and list keys.
- Derive values with `useMemo`; no cascading `useEffect` chains. Memoize only after measuring. `staleTime: Infinity` for static data instead of manual `localStorage`.
- Clean up STOMP/WebSocket clients and global listeners in `useEffect`. Stable list keys, never the array index. Lazy-load heavy routes behind `Suspense`.
- User feedback goes through `NotificationContext`; no native `alert()` / `confirm()`.

## UX behavior
- Every data view handles loading, empty, error (with retry) and success; see `DESIGN.md` "States".
- Forms: sections when over 12 fields, validate on blur/submit, keep user input on error.
- Role-based hiding is cosmetic; the backend enforces access (`@PreAuthorize`).
- Accessible by default: labels, keyboard operation, focus management in dialogs.
