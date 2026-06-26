# Add Order Endpoint

## Purpose
Instructions for safely exposing new order-related queries or mutations via HTTP.

## When to Load
- When adding a new API endpoint to the `OrderController`.

## When NOT to Load
- When altering internal state machine rules.
- When modifying inter-domain events without API changes.

## Assumptions
- Controllers are thin layers. All business logic must reside in `application` services.
- Data access policies (e.g., ownership verification) must happen in the service layer, not the controller.

## Procedure
1. Define the HTTP method and path signature in `OrderController`.
2. Define corresponding DTOs (Request/Response) and ensure `Result/ResultResponses` standard is followed.
3. Implement the business logic inside the appropriate `application` service.
4. Ensure authorization/ownership checks are present in the service layer.
5. Update or create DTO Mappers if required.

## Pitfalls
- Putting business validation or authorization checks in the Controller.
- Returning bare entities instead of DTOs.

## Related Files
- `src/main/java/com/serhat/secondhand/order/api/OrderController.java`
