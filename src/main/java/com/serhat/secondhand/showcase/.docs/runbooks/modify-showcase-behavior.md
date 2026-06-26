# Modify Showcase Behavior

## Purpose
Execution steps for modifying how items are placed into the showcase (vitrin), extending their time, or handling expirations.

## When to Load
- When modifying showcase duration rules.
- When changing the pricing model for showcases.
- When updating the scheduler that expires showcases.

## When NOT to Load
- When modifying the standard listing search features.

## Assumptions
- Showcase extensions and cancellations require strict user ownership validation.
- Pricing is calculated internally based on duration.

## Procedure
1. If adding a new use-case, define the DTO first.
2. Implement validation and ownership checks inside `ShowcaseValidator` and `ShowcaseService`. Do not bypass the `userId` match.
3. If changing queries, use `ShowcaseRepository`. Be aware that the `/active` endpoint uses pagination to prevent memory overflow; preserve this `Pageable` behavior.
4. When extending the mapper (`ShowcaseMapper`), use batch enrichment (single queries for multiple IDs) rather than per-item queries to avoid N+1 issues.

## Pitfalls
- Calling `save()` iteratively during the expiration scheduler instead of `saveAll()`.
- Returning full entity graphs in list endpoints instead of relying on DTO batch mapping.

## Related Files
- `src/main/java/com/serhat/secondhand/showcase/application/ShowcaseService.java`
- `src/main/java/com/serhat/secondhand/showcase/mapper/ShowcaseMapper.java`
