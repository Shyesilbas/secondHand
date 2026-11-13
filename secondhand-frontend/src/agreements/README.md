# Agreements UI Module

Legal terms, privacy policies, distance sales contracts, registration legal gates, and user acceptance version tracking.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`agreements`](../../../src/main/java/com/serhat/secondhand/agreements/README.md)
> - **Architecture Deep Dive:** [`docs/checkout-pipeline-and-distributed-transaction-flow.md`](../../../docs/checkout-pipeline-and-distributed-transaction-flow.md)

## 1. Overview & Purpose

The `agreements` module enforces platform legal compliance and regulatory consent across the marketplace. It manages legal document presentation, user acceptance logging, and version diff audits:
1. **Public Legal Directory:** Public portal (`AgreementsPage`) where any visitor or user can inspect active terms of service, privacy policies, KVKK notices, and cookies rules.
2. **Registration & Checkout Legal Gates:** Embedded checkbox widgets (`AgreementsSection`) integrated into the registration wizard and checkout payment step.
3. **Modal Document Reader:** Full-text viewer (`AgreementModal`) rendering contract clauses with clear typography and scroll-to-accept capabilities.
4. **Version Tracking & Re-Acceptance:** Monitors backend agreement version changes (`isAcceptedTheLastVersion`); prompts existing users when terms are updated.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/agreements` | `AgreementsPage` | Protected |
| `/agreements/all` | `AgreementsPage` | Protected |

| Embedded entry | Where |
|---|---|
| `AgreementModal` | Triggered by link clicks on terms and conditions across the app. |
| `AgreementsSection` | Reusable checkbox list embedded in `RegisterPage` and `CheckoutPage`. |

## 3. Component Rules

- **Mandatory Registration Gate:** The registration form in `auth/` cannot proceed past step 2 until all agreements of group `REGISTER` (`useRegisterAgreements`) are checked.
- **Checkout Distance Sales Gate:** Checkout requires explicit acceptance of the Distance Sales Contract and Preliminary Information Form prior to payment confirmation.
- **Version Tracking:** When agreement versions are incremented on the backend, `isAcceptedTheLastVersion` evaluates to false, prompting users to accept the new version.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `AGREEMENT_KEYS.allAgreements()` | `useAgreements.js` |
| `AGREEMENT_KEYS.required(group)` | `useAgreements.js` |
| `[...AGREEMENT_KEYS.all, 'user', user?.id]` | `useAgreements.js` |

## 5. Form & Data Validation Rules

- **Checkbox Enforcements:** Mandatory checkboxes require explicit boolean `true` state; partial acceptance is rejected by the form validator.
- **Acceptance Payload:** Dispatches `POST /v1/agreements/accept` with `{ agreementId, version }`.
