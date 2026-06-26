# Modify FavoriteList Behavior

## Purpose
Execution instructions for altering how custom listing collections (Favorite Lists) are created, constrained, or summarized.

## When to Load
- When changing limits on items per list or lists per user.
- When adding new summary fields (e.g., average price of a list).
- When modifying privacy controls on a list.

## When NOT to Load
- When modifying single-listing favorites (`favorite` domain).

## Assumptions
- Summary endpoints rely entirely on DB projections, not entity collection mapping, to prevent cartesian explosion.

## Procedure
1. To add a new summary field: Update `FavoriteListSummaryProjection`, amend the aggregate queries in `FavoriteListRepository`, update `FavoriteListSummaryDto`, and adjust `FavoriteListMapper.toSummaryDto()`.
2. Apply business rules in `FavoriteListService`. Reuse private helper methods for repeated checks (like ownership or privacy).
3. Bind any new numeric limits to `FavoriteListConfig` instead of hardcoding them.
4. Let the database handle uniqueness (e.g., `DataIntegrityViolationException`) for race conditions rather than relying solely on pre-save `exists` checks.

## Pitfalls
- Using `collection.size()` on a lazy relationship for validation instead of using a DB `count` query.
- Fetch joining `items` or `likes` on list summary endpoints, causing massive memory overhead.

## Related Files
- `src/main/java/com/serhat/secondhand/favoritelist/application/FavoriteListService.java`
- `src/main/java/com/serhat/secondhand/favoritelist/repository/FavoriteListRepository.java`
