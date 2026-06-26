# Modify Agreement Rules

## Purpose
Execution instructions for adding new agreement types, changing requirement groups, or altering the scheduler/broadcast behavior.

## When to Load
- When adding a new legal agreement (e.g. KVKK, Terms of Service).
- When changing which user groups require which agreements.
- When updating the background broadcast notification service.

## When NOT to Load
- When modifying generic email templates.

## Assumptions
- Agreement version updates trigger a broadcast email to all affected users.
- Required agreements are defined via groups and evaluated lazily or via bulk operations.

## Procedure
1. **New Agreement:** Add to `AgreementType` enum, add content to `AgreementConfig`, and update `AgreementService.getContentForType`. Include in `AgreementGroup` if required.
2. **Acceptance Logic:** If modifying `UserAgreementService.acceptAgreement`, ensure `acceptedTheLastVersion` correctly synchronizes with the latest version. Preserve the backfill logic if the user's previous accepted version was null but compliant.
3. **Broadcast:** If modifying `AgreementUpdateWatcher`, ensure `AgreementUpdateEvent` idempotency is preserved (`agreement_type + version` unique constraint).

## Pitfalls
- Triggering an initialization that wipes existing user acceptance states.
- Running broadcast loops without using the batch filtering mechanism, leading to OOM or duplicate emails.

## Related Files
- `src/main/java/com/serhat/secondhand/agreements/application/AgreementService.java`
- `src/main/java/com/serhat/secondhand/agreements/application/UserAgreementService.java`
