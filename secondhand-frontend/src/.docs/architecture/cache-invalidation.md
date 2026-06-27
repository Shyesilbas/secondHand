Purpose: Keeping cache fresh.
When to Load: After mutations.
When NOT to Load: Read-only views.
Dependencies: None.
Confidence Impact: Required
Risk Level: HIGH
Estimated Token Cost: 120.
Procedure: Invalidate relevant query keys on success.