# Complaints & Trust & Safety UI Module

## 1. Executive Summary & Route Map
The `complaint` module provides user reporting workflows, in-chat violation evidence submission, cooling-off countdown tracking, user grievance ticket history, and one-time sanction appeal submission in alignment with the **Aura Trust & Safety Autonomous Moderation Architecture**.

### Route Map
| Route Path | Component | Access | Lazy Loaded | Purpose |
|---|---|---|---|---|
| `/complaints` | `ComplaintsPage` | `Protected` | Yes | User dispute tracking portal, ticket statuses, resolution notes |

---

## 2. Component Hierarchy & File Structure

```
src/complaint/
├── pages/
│   └── ComplaintsPage.jsx              # User complaint dashboard and ticket tracker
├── components/
│   ├── ComplaintModal.jsx              # Reporting dialog with category picker and evidence text
│   ├── ComplaintCard.jsx               # Ticket card displaying status pill, target item, resolution
│   └── ComplaintButton.jsx             # Contextual trigger button placed on listings, profiles, and chats
├── hooks/
│   └── useComplaints.js                # State management and API mutations for complaints
├── services/
│   └── complaintService.js             # Raw Axios endpoints (/api/v1/complaints/**)
├── types/
│   └── complaintTypes.js               # Report targets, violation categories, ticket statuses
├── utils/
│   └── complaintError.js               # Error code unwrapper and localized error strings
├── complaintConstants.js               # Pagination defaults and status styles
└── README.md                           # Module documentation
```

---

## 3. React Query & State Management

### Query Key Topology
- `['complaints', 'my']`: List of complaints submitted by the authenticated user.
- `['complaints', 'detail', id]`: Single complaint audit details, evidence, and moderation resolution.

### Invalidation Matrix
| Mutation Hook | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createComplaint` | `POST /api/v1/complaints` | `['complaints', 'my']` | Adds new ticket with 2h cooling-off status |
| `submitAppeal` | `POST /api/v1/complaints/{id}/appeal` | `['complaints', 'my']`, `['complaints', 'detail', id]` | Flags ticket as Appeal Submitted |

---

## 4. 4-State UX Handling Discipline

1. **Loading State:**
   - `ComplaintsPage` renders a grid of 6 pulsing card skeleton blocks replicating ticket dimensions.
2. **Empty State:**
   - When user has filed no complaints, renders an empty state with a search/file icon and message: "You have not submitted any complaints yet."
3. **Error State:**
   - Displays inline `<Alert variant="error">` banners inside `ComplaintModal` for submission failures.
4. **Disabled / Submitting State:**
   - "Submit Report" button shows loading spinner and locks form inputs during submission.

---

## 5. Aura Trust & Safety Integration Rules

### 5.1 In-Chat Message Selection Flow
- When triggered from a chat room (`ChatHeader` / `ContactSellerButton`), `ComplaintModal` supports selecting offending messages directly from chat history (`selectedMessageIds`).
- Selected messages are attached as verified evidence without allowing user manipulation.

### 5.2 2-Hour Cooling-Off Indicator
- Newly filed tickets display a subtle neutral cooling-off countdown indicator ("In evaluation buffer: AI evaluation begins in ~2 hours").
- Mitigates impulsive reporting and allows the backend to aggregate multiple reports for the same bad actor.

### 5.3 One-Time Sanction Appeal (`appeal_status`)
- Sanctioned users can submit a single appeal per incident via the appeal form.
- The UI restricts appeal submission to 1 attempt; once evaluated, the appeal status locks permanently to either `UPHELD` or `REVERSED`.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions parsed via `errorUtils.getErrorMessage(err)`:
  - `COMPLAINT_ALREADY_EXISTS` -> "You have already submitted a report for this item."
  - `CANNOT_REPORT_SELF` -> "You cannot submit a complaint against your own account."
  - `COMPLAINT_TEXT_TOO_SHORT` -> "Please provide at least 20 characters describing the issue."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Status Pills:** Neutral semantic tags (Pending, In Review, Resolved, Rejected).
- **Typography:** Ticket IDs and countdown timers use `font-mono tabular-nums`.
- **Zero Emojis:** Strictly prohibited across complaint categories, status badges, and appeal modals.
- **Radius Ceiling:** Cards, modals, buttons, and textareas adhere strictly to `rounded-md`.
