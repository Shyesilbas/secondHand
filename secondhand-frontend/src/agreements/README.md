# Agreements UI Module

Legal terms, privacy policies, distance sales contracts, registration agreements, and user acceptance tracking.

## Architecture

- **`AgreementsPage`:** Public platform page (`/agreements`) rendering all active legal documents with versioning and acceptance status.
- **`AgreementsSection`:** Reusable agreement checkboxes embedded in registration forms and payment checkout steps.
- **`AgreementModal`:** Full-screen or modal reader displaying full markdown or HTML agreement text.
- **Hooks & Services:**
  - `agreementService`: Retrieves platform agreements by group (`REGISTER`, `ONLINE_PAYMENT`), fetches user acceptance history (`/v1/agreements/user-agreements`), and records agreement acceptances (`POST /v1/agreements/accept`).
  - `useRegisterAgreements`: Fetches mandatory registration legal contracts and blocks account creation until all required documents are accepted.
  - `useAgreements`: Manages user accepted agreement lists and version diff checks (`isAcceptedTheLastVersion`).

## Invariants

- **Mandatory Registration Gate:** Users cannot complete registration without checking and accepting all `REGISTER` group agreements.
- **Version Tracking:** When agreement versions update on the backend, `isAcceptedTheLastVersion` evaluates to false, prompting the user for re-acceptance where required.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean typographic hierarchy, accessible scrollable modal viewers, and zero decorative emojis.

