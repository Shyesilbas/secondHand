# Complaints UI Module

Dispute resolution, listing and seller reporting, and complaint ticket tracking.

## Architecture

- **`ComplaintsPage`:** User ticket portal (`/complaints`) displaying submitted complaints, current review statuses (`PENDING`, `IN_REVIEW`, `RESOLVED`, `REJECTED`), and administrative resolution notes.
- **`ComplaintModal`:** Modal dialog capturing report details: target entity (`LISTING`, `USER`, `ORDER`), complaint category (`FRAUD`, `OFFENSIVE`, `SPAM`, `COUNTERFEIT`, `OTHER`), and user narrative.
- **`ComplaintButton`:** Contextual trigger button located on listing pages and user profile cards.
- **`complaintService`:** API service executing `/v1/complaints` creation and `/v1/users/me/complaints` tracking.

## Invariants

- **Protected Access:** Filing and viewing complaints requires authenticated user sessions.
- **Cache Invalidation:** Submitting a new complaint immediately invalidates `['complaints', 'my']` to update the user's ticket list.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clear status pills using semantic tokens, hairline dividers, and zero emojis.

