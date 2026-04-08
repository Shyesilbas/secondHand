# Backend Analysis Report

Scope: `/Users/serhat/IdeaProjects/secondHand`

## Executive Summary

Backend codebase is feature-rich and broadly modular, but the current structure shows a high level of complexity in the listing/favorite/review/notification flows. The main risks are:

1. pagination combined with fetch-join over to-many relations
2. DTO mapping that initializes and traverses lazy graphs inside mappers
3. duplicated feature areas (`favorite` and `favoritelist`)
4. test setup fragility on the current environment

## Priority Findings

### P0 - Pagination + fetch join on to-many relations

`FavoriteListRepository` uses `LEFT JOIN FETCH` on both `items` and `likes` while returning `Page<FavoriteList>`.

- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/favoritelist/repository/FavoriteListRepository.java`
- Lines: 30-48

Why this is a problem:

- JPA pagination with fetch-join on collection relations is a classic source of incorrect page sizes and duplicated rows.
- Fetching two collections at once multiplies result rows and can blow up memory usage quickly.
- The repository is used by `FavoriteListService#getMyLists`, `getUserPublicLists`, and `getListById`, so the cost hits normal user flows.

Related risk:

- `FavoriteListMapper` initializes collections and then walks nested listing objects while building DTOs.
- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/favoritelist/mapper/FavoriteListMapper.java`
- Lines: 25-195

Recommendation:

- Replace paged fetch-join queries with a two-step load strategy or projection DTOs.
- Keep collection loading out of mapper code.
- For summary views, query counts and aggregates directly in SQL/JPQL instead of initializing `items` and `likes`.

### P0 - Test suite is currently broken

`mvn test` fails in the current environment.

Observed failures:

- H2 datasource is trying to use literal `${DB_URL}` instead of a resolved JDBC URL.
- Mockito inline mock maker cannot self-attach on the current JDK 21 runtime in this environment.

Impact:

- CI/local verification is blocked.
- The existing test suite does not currently act as a safety net for refactors.

Recommendation:

- Fix the test profile datasource resolution.
- Remove the Mockito inline agent dependency on self-attach, or configure Mockito/JDK agent support explicitly.
- Add at least one repository/service slice test that boots successfully in the test profile.

### P1 - Listing detail flow is over-enriched and likely to be expensive

`ListingQueryService#findByIdAsDto` combines:

- listing load with seller
- async enrichment
- view stats retrieval for owners
- inline review loading

- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/listing/application/common/ListingQueryService.java`
- Lines: 103-131

Why this matters:

- The detail DTO is built from multiple subsystems, which increases query count and makes the flow hard to reason about.
- `ListingDto` itself is very heavy and carries review stats, review list, favorite stats, view stats and campaign fields.
- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/listing/domain/dto/response/listing/ListingDto.java`
- Lines: 36-81

Recommendation:

- Split listing detail into smaller view models where possible.
- Load review preview, stats and view stats through dedicated endpoints or explicit projection queries.
- Avoid mutating a single DTO from multiple async paths unless there is a measurable payoff.

### P1 - Price change notification loop can become an O(n) hot path

`PriceHistoryService#recordPriceChange` loads all users who favorited a listing and then sends notifications one by one.

- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/listing/application/common/PriceHistoryService.java`
- Lines: 62-84

Why this matters:

- For popular listings this can fan out into many synchronous calls.
- If `sendPriceChangeNotification` persists or publishes per user, this behaves like a batch N+1 pattern.

Recommendation:

- Make the notification fan-out asynchronous or queue-based.
- If notifications are persisted, bulk insert where possible.

### P2 - Duplicate domain area: `favorite` and `favoritelist`

The codebase contains two adjacent features:

- `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/favorite`
- `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/favoritelist`

Why this matters:

- Both areas model user-interest behavior and stats, but with different shapes.
- This increases naming confusion, service overlap, and long-term maintenance cost.

Recommendation:

- Decide whether these are distinct concepts or one feature with two views.
- If they overlap, consolidate shared behaviors and naming.

### P2 - Mapper hides lazy loading and error handling

`FavoriteListMapper` uses `Hibernate.initialize(...)` and catches generic exceptions to silently fall back to defaults.

- File: `/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand/favoritelist/mapper/FavoriteListMapper.java`
- Lines: 71-133

Why this matters:

- It hides data-access problems instead of surfacing them.
- It makes mapper behavior depend on persistence context state.

Recommendation:

- Move collection loading into repository/service methods.
- Keep mappers pure and deterministic.

## Code Structure Observations

- The overall package split is good at the top level: `auth`, `listing`, `order`, `payment`, `review`, `chat`, `notification`, `campaign`, etc.
- Inside those features, some areas are clean and use repository/service/mapper separation well.
- The listing subsystem is the most complex part of the system and has the highest coupling to other subsystems.
- There is strong use of projections, caches and enrichment helpers, but the current layering is starting to accumulate orchestration debt.

## N+1 / Performance Risk Areas

Confirmed or strongly suspicious:

- fetch-join with pagination in favorite lists
- DTO mapping that traverses nested listing, seller, likes, items and review associations
- detail flow that enriches a listing with multiple downstream service calls
- price-change notification fan-out across all favoriting users

## Duplicate / Redundant Patterns

- `favorite` and `favoritelist` feature duplication
- repeated mapper patterns across features, especially DTO-to-entity conversion helpers
- broad use of `Result<T>` wrappers and `findBy...` service methods that return very similar shapes

## Recommended Next Steps

1. Fix the backend test profile so the project can be validated locally and in CI.
2. Remove pagination + fetch-join from `FavoriteListRepository`.
3. Refactor `FavoriteListMapper` to stop initializing relations inside mapping code.
4. Simplify listing detail composition and split heavy DTO concerns.
5. Decide whether `favorite` and `favoritelist` should be merged or explicitly separated by domain meaning.
