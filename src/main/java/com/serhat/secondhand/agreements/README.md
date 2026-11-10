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
- **Incoming:** Initialized via application startup configurations. HTTP requests via `AgreementController`.
- **Outgoing:** Sends broadcast emails via `email` domain when versions are bumped.

## Public APIs
- `GET /api/v1/agreements`: Lists all platform agreements.
- `POST /api/v1/agreements/initialize`: Seeds and initializes system agreements.
- `GET /api/v1/agreements/required`: Lists required agreements for the caller's user group.
- `GET /api/v1/agreements/{agreement-type}`: Retrieves current active text for an agreement type.
- `POST /api/v1/agreements/accept`: Accepts a specific version of an agreement.
- `GET /api/v1/agreements/user/agreements`: Current user's agreement acceptance list.
- `GET /api/v1/agreements/user/status/{agreement-type}`: Verifies if user has accepted the latest version of an agreement.
- `GET /api/v1/agreements/user/acceptance-history/{agreement-id}`: Historical acceptance audit logs for an agreement.

## Related Knowledge
- **Modify Agreement Rules**
  -> `.docs/runbooks/modify-agreement-rules.md`
