# Complaint Domain

## Purpose
The `complaint` domain handles trust, safety, user reporting, listing abuse flagging, and dispute intake across the platform.

## Architecture Overview
- **Complaint Entity:** Links the reporting user (`complainer`), the reported party (`complainedUser`), the optional associated item (`listing`), and the violation reason.
- **ComplaintService:** Handles creation and validation of complaints.
- **ComplaintValidator:** Ensures users cannot file frivolous duplicate complaints or report themselves.

## Business Invariants & Constraints
- **Self-Report Prevention:** A user cannot file a complaint against themselves (`complainer_id != complained_user_id`).
- **Target Association:** A complaint must reference either a specific listing or an identified user account.
- **Complaint Status (`ComplaintStatus`):**
  - `PENDING`: Initial submission awaiting review.
  - `INVESTIGATING`: Under investigation by trust & safety team.
  - `RESOLVED`: Action taken (warning, listing takedown, account ban, or dispute settlement).
  - `DISMISSED`: Found non-violating or invalid claim.

## Integration Points
- **Incoming:** HTTP requests via `ComplaintController`.
- **Outgoing:** Referenced by `user` domain (`UserController`) for querying user-specific complaints.

## Public APIs
- `POST /api/v1/complaints`: Submits a new user or listing complaint.
*(Note: Retrieval of complaints filed by or against the current user is handled via `UserController` at `GET /api/v1/users/me/complaints` and `GET /api/v1/users/me/complaints/received`)*.
