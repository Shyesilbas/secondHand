# Agreements Domain

Manages versioned legal agreements (`agreements`, `user_agreements`, `agreement_requirements`, `agreement_update_events`), group-based mandatory consent checks (`AgreementGroup`: `REGISTER`, `ONLINE_PAYMENT`), and version-bump emails (`AgreementUpdateWatcher`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Frontend Module:** [`secondhand-frontend/src/agreements/README.md`](/secondhand-frontend/src/agreements/README.md)
> - **Key Entry Points:** [`AgreementController`](api/AgreementController.java) · [`AgreementService`](application/AgreementService.java) · [`UserAgreementService`](application/UserAgreementService.java) · [`AgreementRequirementService`](application/AgreementRequirementService.java) · [`AgreementUpdateWatcher`](application/AgreementUpdateWatcher.java) · [`AgreementUpdateNotificationService`](application/AgreementUpdateNotificationService.java) · [`AgreementEmailNotificationService`](application/AgreementEmailNotificationService.java)

## Business Rules & Invariants
- **One row per type, versioned in place (`AgreementService`):** `AgreementType` is `TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `KVKK`, `DISTANCE_SELLING`, `PAYMENT_TERMS`. Each type has one `agreements` row; content changes bump its `x.y.z` `version` (`AgreementVersionHelper`, `INVALID_VERSION`). Default content comes from `AgreementConfig`.
- **Latest-version check (`UserAgreementService.hasUserAcceptedAgreement`):** `user_agreements` keeps one row per user and agreement; accepting again overwrites `acceptedVersion`. A user is compliant only when `acceptedVersion` equals the current `version`; the check also refreshes `isAcceptedTheLastVersion`.
- **Group requirements (`AgreementRequirementService`):** `agreement_requirements` rows (`group_code`, `agreement_type`, unique together) are seeded from `AgreementGroup`: `REGISTER` = terms, privacy, KVKK; `ONLINE_PAYMENT` = distance selling, payment terms. `RegistrationValidator` / `OAuthService` require every `REGISTER` id (`AGREEMENTS_NOT_ACCEPTED`); `PaymentValidator.validatePaymentAgreements` requires every `ONLINE_PAYMENT` id (`AGREEMENTS_NOT_ACCEPTED`, `INVALID_AGREEMENT_COUNT`).
- **Version-bump emails (`AgreementUpdateWatcher`):** every 30 minutes (ShedLock `agreementUpdateWatcher`) each required type's current version is recorded once in `agreement_update_events` (unique `(agreement_type, version)`); a new row triggers `AgreementEmailNotificationService.notifyAllUsersAgreementPublished`, which pages through users and publishes mail events (`mail.dispatch.v1`). There is no in-app or WebSocket notification. Existing acceptances are never reset.
- **Change rule:** New agreement type: add it to `AgreementType`, its content to `AgreementConfig` and `AgreementService.getContentForType`, and to `AgreementGroup` when it is required.

## API (`AgreementController`, `/api/v1/agreements`)
- `GET /` · `GET /required?agreementGroup=` · `GET /{agreement-type}` (`@PublicEndpoint`) — active agreements, required agreements for a group, and single agreement text (`AgreementDto`).
- `POST /initialize` (`hasRole('ADMIN')`) — seed default agreements and requirements.
- `POST /accept` — record user acceptance of a specific agreement version (`UserAgreementDto`).
- `GET /user/agreements` · `GET /user/status/{agreement-type}` · `GET /user/acceptance-history/{agreement-id}` — user's accepted agreements, latest-version boolean check, and acceptance history.
