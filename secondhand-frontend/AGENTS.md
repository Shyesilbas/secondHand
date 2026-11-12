# Frontend (`secondhand-frontend`)

React 19 + Vite, Tailwind 3, React Router 7, React Query 5, Axios, STOMP, `lucide-react`.
- Commands: `npm run dev`, `npm run build`, `npm run lint` (no test runner is configured).

## Required Skills
Before modifying frontend code or UI, load the relevant skill from `.agents/skills/`:
- **`restrained-ui-design-standard`** (`../.agents/skills/restrained-ui-design-standard/SKILL.md`): **Mandatory before any UI change.** Enforces Apple/Spotify-tier restraint, zero emojis, purposeful non-flashy color balance, `rounded-md` ceiling, `theme.js` tokens, 4 data states (`Skeleton`, `EmptyState`, `Alert`, `Disabled`), and pre-completion regex/lint checks.
- **`frontend-modular-architecture`** (`../.agents/skills/frontend-modular-architecture/SKILL.md`): Enforces the 6-section module architecture, React Router 7 routes, component hierarchies, React Query 5 data flow, explicit query key invalidation matrices, form validation standards, and backend error unwrapping.
- **`polymorphic-catalog-and-layered-api`** (`../.agents/skills/polymorphic-catalog-and-layered-api/SKILL.md`): Enforces React Query state discipline (`useQuery`/`useMutation` only, `request.js`, query key arrays, `useEnums`, and dynamic catalog metadata).

## Structure & Shared Primitives
- Feature folders mirror backend modules (`src/<module>/{pages,components,hooks,services}`); module rules are in `src/<module>/README.md` across all feature and catalog vertical packages.
- Shared UI: `common/components/ui` (`Button` + `buttonClasses`, `Modal`, `Skeleton`, `EmptyState`, `Alert`, `DataPagination`); forms: `common/components/forms/{FormPrimitives.jsx,inputStyles.js}`; layout: `common/components/layout` (`PageContainer`, `Header`).
- Hooks: `common/hooks/useEnums.js`, `useLocationOptions`, `useDebouncedValue`, `auth/hooks/useLoginPrompt.js`.
- Clean up STOMP/WebSocket clients and global listeners in `useEffect`. Use stable list keys (never array index) and lazy-load heavy routes behind `Suspense`.
