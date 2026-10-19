# Complaint Domain

## Purpose
The `complaint` domain handles trust, safety, user reporting, listing abuse flagging, and moderator dispute resolution across the platform.

## Architecture Overview
- **Complaint Entity:** Links the reporting user (`complainer`), the reported party (`complainedUser`), the optional associated item (`listing`), and the violation reason.
- **Moderator Workflow:** Transitions complaints through explicit review stages with moderation notes and resolution timestamps.
- **Validation Engine:** `ComplaintValidator` ensures users cannot file frivolous duplicate complaints or report themselves.

## Business Invariants & Constraints
- **Self-Report Prevention:** A user cannot file a complaint against themselves (`complainer_id != complained_user_id`).
- **Target Association:** A complaint must reference either a specific listing or an identified user account.
- **State Progression:**
  - `PENDING`: Initial submission awaiting moderator intake.
  - `IN_REVIEW`: Assigned to a trust & safety staff member for investigation.
  - `RESOLVED`: Action taken (warning, listing takedown, account ban, or dispute settlement).
  - `REJECTED`: Found non-violating or fraudulent claim.

## Public APIs
- `POST /api/v1/complaints`: Submits a new user or listing complaint.
- `GET /api/v1/complaints/my-complaints`: Lists complaints filed by the authenticated user.
- `GET /api/v1/complaints`: Administrative endpoint to filter complaints by status, user, or date.
- `PUT /api/v1/complaints/{id}/status`: Administrative endpoint to update status and record resolution notes.
