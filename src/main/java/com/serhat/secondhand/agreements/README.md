# Agreements Domain

## Purpose
The `agreements` domain manages legal texts, platform terms, mandatory user consent rules, and background version-update broadcasting.

## Architecture Overview
- **AgreementService:** Manages core agreement contents and versioning logic.
- **UserAgreementService:** Tracks individual user consent and handles batch acceptance flows.
- **AgreementUpdateWatcher:** A background job that monitors for version changes and triggers broadcast emails.
- **Schema Validation:** Checks PostgreSQL column constraints on startup via `AgreementSchemaStartupRunner`.

## Business Invariants & Constraints
- **Version Compatibility:** A user's `acceptedTheLastVersion` flag is dynamically derived based on the current active version of the agreement.
- **Idempotency:** Broadcast notifications rely on a unique constraint (`agreement_type + version`) to prevent duplicate update emails.
- **Group Requirements:** Required agreements are evaluated based on the user's operational group (e.g., standard users vs. corporate sellers).

## State Machines
- **Acceptance Status:** Unaccepted -> Accepted (specific version).

## Integration Points
- **Incoming:** Initialized via application startup configurations.
- **Outgoing:** Sends broadcast emails via `email` domain when versions are bumped.

## Public APIs
- Standard Acceptance Endpoints, Initialization endpoints.

## Related Knowledge
- **Modify Agreement Rules**
  -> `.docs/runbooks/modify-agreement-rules.md`
