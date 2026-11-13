# Agreements Domain

Manages versioned legal agreements (`agreements`, `user_agreements`, `agreement_requirements`, `agreement_update_events`), stage-based mandatory consent checks (`REGISTRATION`, `CHECKOUT`, `SELLER_ONBOARDING`), and version-bump broadcasts (`AgreementUpdateWatcher`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Frontend Module:** [`secondhand-frontend/src/agreements/README.md`](/secondhand-frontend/src/agreements/README.md)
> - **Key Entry Points:** [`AgreementController`](api/AgreementController.java) · [`AgreementService`](application/AgreementService.java) · [`UserAgreementService`](application/UserAgreementService.java) · [`AgreementRequirementService`](application/AgreementRequirementService.java) · [`AgreementUpdateWatcher`](application/AgreementUpdateWatcher.java) · [`AgreementUpdateNotificationService`](application/AgreementUpdateNotificationService.java) · [`AgreementEmailNotificationService`](application/AgreementEmailNotificationService.java)

## Business Rules & Invariants
- **Versioned Acceptance Audit (`hasUserAcceptedAgreement`):** `agreements` rows are unique on `(type, version)` (`AgreementType`: `TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `DISTANCE_SALES_CONTRACT`, `BUYER_AGREEMENT`, `SELLER_AGREEMENT`, `KVKK_EXPLICIT_CONSENT`). A user is considered compliant only when `user_agreements` contains an acceptance matching the latest active `version` (`AGREEMENT_ALREADY_ACCEPTED` on duplicate acceptance of the same version).
- **Stage-Scoped Requirements (`AgreementRequirementService`):** Evaluates mandatory agreements per `user_group` (`REGISTRATION`, `CHECKOUT`, `SELLER_ONBOARDING`) and `AgreementGroup` (`ALL_USERS`, `BUYER_ONLY`, `SELLER_ONLY`), enforced before registration or `PaymentPreCheckService`.
- **Version-Bump Broadcasts (`AgreementUpdateWatcher`):** When an agreement version increments, `AgreementUpdateWatcher` dispatches a broadcast WebSocket alert (`NotificationTemplateCatalog.agreementUpdatedBroadcast`) and notification emails (`EmailEventPublisher` -> `mail.dispatch.v1`) so clients prompt re-acceptance.
- **Change rule:** New agreement type: add it to `AgreementType`, its content to `AgreementConfig` and `AgreementService.getContentForType`, and to `AgreementGroup` when it is required.
- **Change rule:** `AgreementUpdateWatcher` broadcasts stay idempotent via the `(agreement_type, version)` unique constraint and send in batches; never reset existing acceptances.

## API (`AgreementController`, `/api/v1/agreements`)
- `GET /` · `GET /required?agreementGroup=` · `GET /{agreement-type}` (`@PublicEndpoint`) — active agreements, required agreements for a group, and single agreement text (`AgreementDto`).
- `POST /initialize` (`ROLE_ADMIN`) — seed default agreements and requirements.
- `POST /accept` — record user acceptance of a specific agreement version (`UserAgreementDto`).
- `GET /user/agreements` · `GET /user/status/{agreement-type}` · `GET /user/acceptance-history/{agreement-id}` — user's accepted agreements, latest-version boolean check, and acceptance history.
