# Frontend Analysis Report

Scope: `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend`

## Executive Summary

Frontend architecture is feature-based and generally understandable, but code health is currently weak:

- `eslint` reports 188 problems
- many hooks violate React rules or dependency hygiene
- there are duplicated context/service patterns across feature areas
- some route and auth wiring is structurally unsafe

## Priority Findings

### P0 - `AppRoutes` violates Hooks rules

`AppRoutes` calls `useAuth()` inside a `try/catch` and returns early based on the catch branch.

- File: `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/routes/AppRoutes.jsx`
- Lines: 89-100

Why this is a problem:

- Hooks must be called unconditionally in the same order.
- Catching around a hook call is a structural correctness issue, not just a style issue.
- The lint output already flags this as `react-hooks/rules-of-hooks`.

Recommendation:

- Move AuthProvider wiring so `AppRoutes` is only rendered inside a valid auth context.
- Replace the catch-based fallback with a wrapper component or loading gate outside the hook caller.

### P0 - Lint is red across the project

`npm run lint` currently fails with 188 problems.

Observed pattern:

- many `no-unused-vars`
- many `no-empty`
- several `react-hooks/exhaustive-deps`
- several `react-refresh/only-export-components`
- some `rules-of-hooks`

Impact:

- The project has real correctness risks hidden behind lint noise.
- The amount of noise makes regressions easy to miss.

Recommendation:

- Fix rule-of-hooks and empty-block errors first.
- Then clean up unused variables and dependency arrays.
- Treat lint as a required gate again.

### P1 - Notification state is duplicated and over-invalidated

`useInAppNotifications` keeps both React Query state and a separate local `unreadCount` state.

- File: `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/notification/hooks/useInAppNotifications.js`
- Lines: 7-110

Why this matters:

- The unread count is derived from query data, but also stored separately.
- `invalidateQueries({ queryKey: ['notifications'] })` is broad and can refetch more than needed.
- `refetchUnreadCount` is declared but never used.

Recommendation:

- Keep unread count as a single source of truth, ideally query cache derived.
- Narrow invalidation keys.
- Remove the unused refetch handle.

### P1 - Shared enum context files are duplicated and not compiler-friendly

There are many near-parallel enum context files:

- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/BookEnumContext.jsx`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/ClothingEnumContext.jsx`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/ElectronicsEnumContext.jsx`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/RealEstateEnumContext.jsx`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/SportEnumContext.jsx`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/contexts/VehicleEnumContext.jsx`

Why this matters:

- Lint flags all of them with `react-refresh/only-export-components`.
- The duplication suggests the enum loading pattern should be centralized.

Recommendation:

- Create a single generic enum context factory or shared hook.
- Keep component exports separate from utility exports to satisfy fast refresh.

### P1 - API interceptor is brittle and hard to maintain

The Axios interceptor contains:

- token refresh queueing
- auth context mutation through a module ref
- CSRF extraction from cookies
- custom retry exceptions

- File: `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/common/services/api/interceptors.js`
- Lines: 1-170

Why this matters:

- The file mixes transport, auth state, retry policy and cross-cutting error handling.
- That makes failures hard to reason about and easy to regress.

Recommendation:

- Split refresh/retry policy from request decoration.
- Keep auth context side effects minimal.
- Add tests for refresh failure and queue behavior.

### P2 - Service and hook duplication across features

Feature folders repeat the same shapes:

- service wrapper
- data hook
- modal/component pair
- small utility helpers

Examples:

- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/reviews/services/reviewService.js`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/forum/services/forumService.js`
- `/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src/listing/services/listingService.js`

Why this matters:

- There is a lot of repeated request-building and error-handling logic.
- Each feature is solving the same problems slightly differently.

Recommendation:

- Consolidate request serialization helpers.
- Normalize pagination/query building utilities.
- Move repeated modal/form patterns into shared primitives where the UX allows it.

## Code Structure Observations

- The app is feature-based and the route map is thoughtfully split by domain.
- Lazy loading is used well for large pages.
- Common services are present, but they are not yet strict enough to prevent duplication.
- Some features, especially notification, listing, payments and auth, have accumulated orchestration logic inside hooks and contexts.

## Performance / Behavioral Risk Areas

Confirmed or suspicious:

- broad query invalidation in notification flows
- duplicate local state and query state for unread counts
- hook dependency problems that can trigger repeated effects or stale closures
- route-level catch-based hook usage that can break render behavior

## Duplicate / Redundant Patterns

- repeated enum context files
- repeated service wrappers across feature folders
- duplicated notification state management
- several feature-specific utilities that are nearly identical in shape

## Recommended Next Steps

1. Fix the `AppRoutes` hook rule violation.
2. Reduce lint noise to zero or near-zero before adding more features.
3. Refactor notification state so unread count has one source of truth.
4. Centralize enum/context and request helper patterns.
5. Review feature folders for shared components that can replace repeated modal/service code.
