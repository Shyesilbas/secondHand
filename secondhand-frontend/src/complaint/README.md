# Complaints UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`complaint`](../../../src/main/java/com/serhat/secondhand/complaint/README.md)
> - **Design:** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](../../../docs/proposals/aura-trust-safety-and-complaint-moderation.md)

## 1. Executive Summary & Route Map

| Path | Page | Access |
|---|---|---|
| `/complaints` | `ComplaintsPage` | Protected |

`ComplaintsPage` has two tabs (filed by me, about me), the `RestrictionBanner`, and `AppealModal` for appealable decisions.

## 2. React Query Keys

Generated from code; `complaintConstants.js` and the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `COMPLAINT_KEYS.my()` | `useComplaints.js` (`useMyComplaints`) |
| `COMPLAINT_KEYS.received()` | `useComplaints.js` (`useReceivedComplaints`) |
| `COMPLAINT_KEYS.restriction()` | `useComplaints.js` (`useMyRestriction`) |

| Invalidated / updated key | By |
|---|---|
| `COMPLAINT_KEYS.my()` | `useCreateComplaint` |
| `COMPLAINT_KEYS.received()` | `useSubmitAppeal` (`setQueryData`) |

## 3. Module Rules
- **Entry points:** `ComplaintButton` in `UserProfileHeader` and `ListingBuyBox` (listing complaint); `ReportMessageModal` from the chat message flag in `MessageList` (sends `chatRoomId` and `reportedMessageId`).
- **Evidence:** `EvidenceImagePicker` uploads through the image endpoint; the limit mirrors `app.moderation.max-evidence-images`.
- **Appeal:** offered only while `appealStatus` is `NONE` and `appealDeadline` is in the future; the backend validates again.
- **Errors:** show backend codes (`COMPLAINT_ALREADY_EXISTS`, `APPEAL_WINDOW_CLOSED`) via `getErrorMessage`.
