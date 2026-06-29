# Order Testing Guidelines Runbook

## Purpose
Provides instructions for writing, maintaining, and running unit tests for the order domain package.

## When to Load
- When implementing a new feature or modification in the order domain.
- When resolving bugs in order validation, checkout, or transition phases.
- When expanding test coverage for order processes.

## When NOT to Load
- When writing frontend UI unit tests.
- When modifying database migration scripts directly.

## Assumptions
- Domain entities and policy checks are tested directly without Mockito mocks to ensure state machine correctness.
- Application services are tested using Mockito mocks for database, payment, and event dependencies.

## Procedure
1. **Rich Entity Tests (`OrderTest.java`)**:
   - Write tests directly using Java constructors or builder methods (no mocks).
   - Verify state transition exceptions (e.g. attempting to cancel a shipped order throws `IllegalStateException`).
2. **Policy Tests (`OrderPolicyTest.java`)**:
   - Verify `OrderCancellationPolicy`, `OrderCompletionPolicy`, and `OrderRefundPolicy`.
   - Test temporal validation windows (e.g., refund fails if delivered time > 48 hours).
3. **Service Orchestration Tests**:
   - Mock dependencies (`OrderRepository`, `EscrowService`, etc.) using Mockito.
   - Assert correct total amount calculations and conditional path updates (Cargo vs Safe Meetup).
4. **Execution**:
   - Run order test suites specifically using Java 17 home setup:
     ```bash
     JAVA_HOME=/Users/serhat/Library/Java/JavaVirtualMachines/corretto-17.0.14/Contents/Home ./mvnw test -Dtest=*Order*Test -Dmaven.test.skip=false
     ```

## Pitfalls
- Bypassing the policy classes during service-level testing.
- Forgetting to override the default JVM with Java 17 path when executing Maven builds.

## Related Files
- `src/test/java/com/serhat/secondhand/order/`
