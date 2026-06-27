Purpose: Define async state ownership.
When to Load: Modifying data fetching.
When NOT to Load: UI layout changes.
Dependencies: None.
Confidence Impact: Required
Risk Level: HIGH
Estimated Token Cost: 200.
Related KIs: state-ownership.md
Procedure: React Query owns async state. Never copy query data into local state.