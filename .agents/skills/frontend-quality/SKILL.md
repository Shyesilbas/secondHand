---
name: Frontend Quality Control
description: Inspects compliance with React standards during frontend code writing or architectural review.
triggers:
  - "frontend audit"
---

# Frontend Quality Control

## Trigger
Triggered by "frontend audit".

## Zero-I/O Architectural Rules
- **Data Fetching:** Use `react-query` (`useQuery`, `useMutation`). Direct `fetch`/`axios` inside `useEffect` is strictly prohibited.
- **State Management:** Use `useMemo` for derived state. Do not set up cascading `useEffect` chains (A triggers B triggers C).
- **Cache Management:** Use `react-query` `staleTime: Infinity` for static data instead of manual `localStorage.setItem`.
- **Event Cleanup:** WebSocket connections (STOMP) or global event listeners must provide proper cleanup functions in their `useEffect` hooks (`client.deactivate()`).
- **Component Design:** Keep components modular. Split large components.
- **List Keys:** Arrays mapped in JSX must use unique, stable keys. Prohibit array index as key where possible.

## Workflow Steps

### 1. Evaluate Data Fetching and State
Check compliance with React Query rules and derived state rules above.

### 2. Evaluate Event Cleanup & UI Standards
Verify cleanup logic and component modularity.

### 3. Output Format
Provide a quality control report highlighting violations of the standards defined above, along with proposed fixes. Do not apply fixes without approval.
