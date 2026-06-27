Purpose: Determine correct mutation cache updates.
When to Load: After completing any API mutation.
When NOT to Load: Reading data.
Dependencies: None.
Confidence Impact: Required.
Risk Level: HIGH.
Estimated Token Cost: 100.
Procedure:
Mutation completed
↓
Does server return updated object?
 YES
 ↓
 setQueryData
------------
 NO
 ↓
 invalidateQueries
------------
 Is list affected?
 YES
 ↓
 invalidate list
------------
 Single object?
 ↓
 invalidate detail
