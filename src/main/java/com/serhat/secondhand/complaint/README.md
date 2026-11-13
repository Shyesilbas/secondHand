# Complaint Domain

Stores user-to-user complaints (`complaints` table), optionally tied to a listing. No automated moderation is implemented yet.

> [!NOTE]
> **Related Documentation:**
> - **Proposal (not implemented):** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](/docs/proposals/aura-trust-safety-and-complaint-moderation.md) — Aura AI moderation, cooling-off queue, sanction ladder, appeals. Open only when building that feature.
> - **Frontend Module:** [`secondhand-frontend/src/complaint/README.md`](/secondhand-frontend/src/complaint/README.md)
> - **Key Entry Points:** [`ComplaintController`](api/ComplaintController.java) · [`ComplaintService`](application/ComplaintService.java) · [`ComplaintValidator`](validator/ComplaintValidator.java) · [`ComplaintMapper`](ComplaintMapper.java)

## Business Rules & Invariants
- **Ids required:** complainer and complained user ids must be present (`COMPLAINER_ID_NULL`, `COMPLAINED_USER_ID_NULL`).
- **No self-complaints:** `CANNOT_COMPLAIN_ABOUT_SELF`.
- **One complaint per pair:** a second complaint about the same user returns `COMPLAINT_ALREADY_EXISTS` (409).
- **Status:** `ComplaintStatus` = `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`; nothing transitions it automatically today.

## API
- `POST /api/v1/complaints` (`ComplaintController`) — submit a complaint (`ComplaintRequest`).
- `GET /api/v1/users/me/complaints` and `GET /api/v1/users/me/complaints/received` (`UserController`) — complaints filed by / against the current user.
