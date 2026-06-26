# Cart Feature Runbook

## Purpose
Execution steps for adding new functionality to the Cart domain, particularly around reservations and stock checking.

## When to Load
- When modifying cart behavior, low stock reservation logic, or cart cleanup mechanisms.

## When NOT to Load
- When fixing purely presentation layer bugs.
- When working on checkout payment orchestration.

## Assumptions
- The Cart relies heavily on transient reservations that automatically expire.

## Procedure
1. Define the business rule in `CartValidator` first.
2. If the rule requires new configuration, map it under `app.cart.*` in `CartConfig`.
3. Integrate the validation into `CartService`.
4. If adding queries, ensure they are added to `CartRepository` with proper N+1 prevention (join fetch).
5. Ensure `CartDto` and `CartMapper` are updated synchronously if API response shapes change.
6. Test against parallel add/update conflicts, and reservation timeout cleanups.

## Pitfalls
- Ignoring time zones during `CartMapper` execution.
- Treating parallel DB unique conflicts as 500 server errors rather than 400 business errors.

## Related Files
- `src/main/java/com/serhat/secondhand/cart/application/CartService.java`
- `src/main/java/com/serhat/secondhand/cart/validator/CartValidator.java`
