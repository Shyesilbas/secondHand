# Payment Testing Guidelines Runbook

## Purpose
Provides instructions for writing, maintaining, and running unit tests for the payment domain package.

## When to Load
- When implementing a new payment strategy or modification in the payment domain.
- When resolving bugs in payment pre-checks, idempotency claims, or transactional event dispatching.
- When expanding test coverage for payment processes.

## When NOT to Load
- When writing frontend UI unit tests.
- When modifying order-specific lifecycle logic unrelated to payments.

## Assumptions
- Custom DTOs (`PaymentDto`) and entity results (`PaymentResult`) are Java records and should be mocked or initialized with their full constructors.
- `PaymentProcessor` uses self-invocation (`self`) to trigger database transactions, which is mocked using reflection in unit tests.
- `TransactionAspectSupport` rollback exceptions must be handled in unit tests where no active transactional manager context is present.

## Procedure
1. **Request Factory Tests (`PaymentRequestFactoryTest.java`)**:
   - Verify proportional amount split distribution and cent reconciliation.
   - Assert correct builders for showcases and memberships.
2. **Pre-Check Tests (`PaymentPreCheckServiceTest.java`)**:
   - Assert validation results for agreements and OTP verification code matches.
   - Verify that auto-renewal requests bypass agreement and verification checks.
3. **Processor Tests (`PaymentProcessorTest.java`)**:
   - Mock Redis Claim results (`ACQUIRED`, `ALREADY_COMPLETED`, `IN_PROGRESS`, `CONFLICT`).
   - Mock internal strategy processing loops.
   - Test optimistic locking retries (up to 3 attempts).
4. **Execution**:
   - Run payment test suites specifically using Java 17 home setup:
     ```bash
     JAVA_HOME=/Users/serhat/Library/Java/JavaVirtualMachines/corretto-17.0.14/Contents/Home ./mvnw test -Dtest=*Payment*Test -Dmaven.test.skip=false
     ```

## Pitfalls
- Overlooking record generic parameter positions when instantiating requests.
- Swapping generic Result constructor fields during assertions.
- Assuming active transactional context exists in mocked service unit tests.

## Related Files
- `src/test/java/com/serhat/secondhand/payment/`
