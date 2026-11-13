# Complaints UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`complaint`](../../../src/main/java/com/serhat/secondhand/complaint/README.md)
> - **Proposal (not implemented):** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](../../../docs/proposals/aura-trust-safety-and-complaint-moderation.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/complaints` | `ComplaintsPage` | Protected |

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `COMPLAINT_KEYS.my()` | `useComplaints.js` |

| Invalidated / updated key | By |
|---|---|
| `COMPLAINT_KEYS.all` | `useComplaints.js` |

## 3. Module Rules
- **Entry point:** `ComplaintButton` (opens `ComplaintModal`) is embedded in `UserProfileHeader`; complaints target a user, optionally with a listing.
- **Backend rules:** duplicate complaint about the same user returns `COMPLAINT_ALREADY_EXISTS` (409), self-complaint `CANNOT_COMPLAIN_ABOUT_SELF`; show them via `getErrorMessage`.
- **Not implemented:** chat-message evidence, cooling-off indicator and appeals exist only in the proposal doc.
