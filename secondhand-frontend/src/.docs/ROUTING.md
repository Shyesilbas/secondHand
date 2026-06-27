# Frontend Intent Routing Table

| Intent | Load Documents | Load KIs | Skip Documents | Estimated Budget | Expected Confidence | Escalation Rules |
|--------|----------------|----------|----------------|------------------|---------------------|------------------|
| Visual polish | Target Component | `.docs/design-system/page-layout.md` | Architecture, APIs | ~400 tokens | 95% | If breaks layout -> responsive.md |
| Layout redesign | Target Component | `responsive.md`, `page-layout.md` | React Query, State | ~500 tokens | 90% | - |
| Accessibility | Target Component | `accessibility.md` | Logic KIs | ~300 tokens | 95% | - |
| Performance | Target Component | `performance.md`, `memoization-guidelines.md` | UX KIs | ~600 tokens | 85% | - |
| React Query bug | Target Component, Service | `react-query-ownership.md` | CSS, UI | ~800 tokens | 90% | Domain README -> Component code |
| Mutation bug | Target Component, Service | `mutation-patterns.md`, `cache-invalidation.md` | UX KIs | ~700 tokens | 85% | - |
| Cache bug | Target Component, Service | `cache-invalidation.md`, `query-key-conventions.md`| UX KIs | ~600 tokens | 90% | - |
| Component bug | Target Component | `component-boundaries.md` | Backend docs | ~500 tokens | 95% | Domain README |
| Page redesign | Target Page | `page-layout.md`, `responsive.md` | State KIs | ~800 tokens | 85% | - |
| New CRUD page | New Page | `crud-pages.md`, `forms.md`, `tables.md` | Other feature KIs | ~1200 tokens | 90% | - |
| Dashboard | Dashboard Page | `cards.md`, `layout.md` | Forms KIs | ~800 tokens | 90% | - |
| Search page | Search Page | `search.md`, `filters.md` | Forms KIs | ~700 tokens | 90% | - |
| Dialog redesign | Dialog Component | `dialogs.md`, `animations.md` | Routing KIs | ~400 tokens | 95% | - |
| Forms | Target Form | `forms.md`, `validation.md`, `form-patterns.md` | Tables KIs | ~900 tokens | 90% | - |
