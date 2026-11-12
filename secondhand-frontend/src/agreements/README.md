# Agreements UI Module

Legal terms, privacy policies, distance sales contracts, registration legal gates, and user acceptance version tracking.

---

## 1. Overview & Purpose

The `agreements` module enforces platform legal compliance and regulatory consent across the marketplace. It manages legal document presentation, user acceptance logging, and version diff audits:
1. **Public Legal Directory:** Public portal (`AgreementsPage`) where any visitor or user can inspect active terms of service, privacy policies, KVKK notices, and cookies rules.
2. **Registration & Checkout Legal Gates:** Embedded checkbox widgets (`AgreementsSection`) integrated into the registration wizard and checkout payment step.
3. **Modal Document Reader:** Full-text viewer (`AgreementModal`) rendering contract clauses with clear typography and scroll-to-accept capabilities.
4. **Version Tracking & Re-Acceptance:** Monitors backend agreement version changes (`isAcceptedTheLastVersion`); prompts existing users when terms are updated.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/agreements` | Public | `AgreementsPage` | Public directory of active legal contracts and platform policies. |
| In-Modal / Embedded | Public | `AgreementModal` | Triggered by link clicks on terms and conditions across the app. |
| Embedded Section | Public / Protected | `AgreementsSection` | Reusable checkbox list embedded in `RegisterPage` and `CheckoutPage`. |

---

## 3. Component Hierarchy & Core Sub-Components

```
agreements/
├── pages/
│   ├── AgreementsPage.jsx             # Public legal directory page
│   └── AgreementsList.jsx             # List container for agreement cards
├── components/
│   ├── AgreementModal.jsx             # Full-screen / modal agreement text reader
│   ├── AgreementCard.jsx              # Summary card showing document title and version
│   └── AgreementsSection.jsx          # Checkbox group embedded in forms
├── hooks/
│   ├── useAgreements.js               # User acceptance queries and acceptance mutations
│   └── useRegisterAgreements.js       # Mandatory registration agreement loader
├── services/
│   └── agreementService.js            # REST client for /v1/agreements endpoints
├── agreements.js                      # Group constants and contract DTO definitions
└── index.js                           # Module exports
```

### Component Roles & Invariants
- **Mandatory Registration Gate:** The registration form in `auth/` cannot proceed past step 2 until all agreements tagged under `AGREEMENT_GROUPS.REGISTER` are checked.
- **Checkout Distance Sales Gate:** Checkout requires explicit acceptance of the Distance Sales Contract and Preliminary Information Form prior to payment confirmation.
- **Version Tracking:** When agreement versions are incremented on the backend, `isAcceptedTheLastVersion` evaluates to false, prompting users to accept the new version.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['agreements', 'group', group]` | Active agreements by group (`REGISTER`, `CHECKOUT`) | 10 min (`600000ms`) | 30 min (`1800000ms`) | Admin contract version bump |
| `['agreements', 'user']` | Current user's acceptance history | 5 min (`300000ms`) | 15 min (`900000ms`) | Successful `acceptAgreement` mutation |
| `['agreements', agreementId, 'content']` | Full document body text | 15 min (`900000ms`) | 60 min (`3600000ms`) | Static content cache |

### Hooks Contract
- `useRegisterAgreements()`: Fetches mandatory registration agreements, providing `{ agreements, isLoading, error }`.
- `useAgreements()`: Returns `{ userAgreements, isAcceptedTheLastVersion, acceptAgreement, isLoading }`.

---

## 5. Form & Data Validation Rules

- **Checkbox Enforcements:** Mandatory checkboxes require explicit boolean `true` state; partial acceptance is rejected by the form validator.
- **Acceptance Payload:** Dispatches `POST /v1/agreements/accept` with `{ agreementId, version }`.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `AgreementsPage` renders document skeleton cards; `AgreementModal` shows an inline text skeleton while downloading contract text.
2. **Empty State:** If a group has no active agreements, renders a neutral message indicating all terms are up to date.
3. **Error State:** Surfaces inline retry alert if legal documents fail to load, preventing user from submitting the host form while in an uncertain legal state.
4. **Data State:** Clean list of legal agreements with version number badges, last updated dates, and view links.

### Backend Error Contract
- Handled via `handleError` and localized notifications.
- Known error codes:
  - `AGREEMENT_NOT_FOUND`: Document ID does not correspond to an active legal contract.
  - `AGREEMENT_ALREADY_ACCEPTED`: Idempotent response if document was previously accepted.

### Restrained Design Tokens
- **Version Badges:** Subdued neutral tags (`bg-surface-alt text-muted-foreground border-border text-xs`).
- **Modal Typography:** Clean readable prose (`prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed`).
- **Corners & Borders:** Standardized `rounded-md` on modal frames and agreement cards.
