# Active State

This is the ONLY state tracking file for AI execution. Update this file immediately when active work changes.

# Active Tasks

## Current Work
- Status: In Progress
- Active Task: Email Architecture Refactoring & Template Modernization Completed
- Next Step: Ready for user testing / review.

## Backlog / Completed
- [x] Fixed Kafka Deserialization Exception in `inventory-sync-consumers` with `ErrorHandlingDeserializer`.
- [x] Implemented Checkout Page Stock Reservation via `POST /api/checkout/initiate` (Redis TTL 15 min).
- [x] Fixed broken/duplicate HTML tags across Thymeleaf templates (`offers/accepted.html`, `offers/rejected.html`, `offers/completed.html`, `offers/expired.html`, `orders/sale-notification.html`, `payments/receipt.html`).
- [x] Migrated all hardcoded email text and subjects from YAML into Spring `MessageSource` bundles (`messages.properties` & `messages_en.properties`).
- [x] Cleaned `application-email.yml` to contain only infrastructure and SMTP settings.
- [x] Modernized email templates (`orders/*`, `notifications/*`, `offers/*`, `payments/*`, `system/*`) with SecondHand design system.
- [x] Upgraded `emailExecutor` async pool configuration (5 core, 20 max, 500 queue, CallerRunsPolicy).
- [x] Synchronized [email/README.md](file:///Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/email/README.md) documenting all 23 email event workflows and retry schedulers.

## Next Work
- AI streaming endpoint test
- Postman import and manual testing
- Close role-based controller endpoints missing `@PreAuthorize`
- CI/CD pipeline setup

## Open Risks
- Verify missing `@PreAuthorize` endpoints
- `usePlan` hook fetches on every component mount, check `staleTime`
- Test Offer card mobile view
- Payment repository `findByFilters` query is complex and carries performance risk
- Global cache invalidation in `PaymentProcessor` may negatively impact performance
