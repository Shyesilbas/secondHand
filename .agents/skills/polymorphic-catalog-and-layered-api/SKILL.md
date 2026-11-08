---
name: polymorphic-catalog-and-layered-api
description: Use this skill when adding or modifying Spring Boot endpoints, domain validators/policies, Flyway migrations, 6-category polymorphic listings (Vehicles, Electronics, Real Estate, Clothing, Books, Sports), JSON catalog seeds, or React Query API integrations.
---

# Layered Spring Boot API, Polymorphic Catalog & React Query Contract

Follow these standards whenever building or refactoring backend endpoints, database schemas, catalog seeders/validators, or frontend API data flows.

## 1. Layered Backend Architecture & API Contract
- **Strict Layering:** `controller -> service -> validator/policy -> repository -> mapper`.
  - Controllers are thin HTTP adapters; never place business rules, state checks, or ownership validation inside a controller.
  - Never return JPA entities from controllers; always use request/response DTOs with `jakarta.validation` annotations and MapStruct mappers.
- **Standard Response Envelope:** All controllers return `ResponseEntity<Result<T>>` via `ResultResponses` (`ok`, `created`, `noContent`, etc.).
  - Success HTTP body is the DTO itself (`response.data`, never nested `response.data.data`).
  - Error HTTP body is `{ "error": "CODE", "message": "..." }` produced via domain error-code enums (e.g., `AuthErrorCodes`, `PaymentErrorCodes`), never hardcoded error strings.
- **Contract-First Implementation Order:** Define HTTP method, `/api/v1/<domain>/<resource>` path, auth rule, DTOs, and error codes first; then implement in order: `DTOs -> repository -> validator/policy -> service -> controller`.
- **N+1 & Pagination Discipline:** Every list query requires `Pageable` and explicit N+1 prevention (`@EntityGraph(attributePaths = {"seller"})` or `JOIN FETCH`). Enrich listing reads asynchronously via `CompletableFuture` and keep view tracking `@Async`.

## 2. Security Filter Chain & Access Control
- **Filter Order:** `RateLimitingFilter` -> `CsrfCookieFilter` (double-submit cookie) -> `AuthenticationFilter` (stateless JWT access + rotated refresh cookies) -> `SecurityHeadersFilter`.
- **Endpoint Classification:** Unprotected routes must be explicitly annotated with `@PublicEndpoint` (registered via `PublicEndpointRegistry`). Role-restricted routes require `@PreAuthorize`.
- **IDOR / Ownership Protection:** Every mutation or private read on a user-scoped resource (listings, orders, carts, offers, addresses, chat rooms) must verify resource ownership (`validateOwnership()`) in the service/domain layer.
- **WebSocket Security:** STOMP connections validate JWT on connect (`WebSocketSecurityConfig`) and enforce room subscription ownership.

## 3. Flyway Migrations & Deterministic Catalog Seeding
- **Flyway Immutability:** Schema changes are made exclusively by adding a new `V<N>__description.sql` file under `src/main/resources/db/migration/`. Never edit or reorder existing migrations (`V1` through `V23+`).
- **6 Polymorphic Listing Verticals:** `Vehicle`, `Electronics`, `RealEstate`, `Clothing`, `Books`, and `Sports` inherit from `Listing` using `JOINED` JPA inheritance, orchestrated via `AbstractListingService` (Template Method) and validated through `ListingValidationEngine` (Chain of Responsibility).
- **Deterministic UUID Upserts (`src/main/resources/data/**`):**
  - Reference/catalog entities (`CarBrand`, `VehicleType`, `VehicleModel`, `VehicleGeneration`, `VehicleEngine`, `VehicleVersion`, `ElectronicBrand`, `ElectronicType`, `ElectronicModel`, `ClothingBrand`, `ClothingType`, `BookType`, `BookGenre`, `BookLanguage`, `BookFormat`, `BookCondition`, `SportDiscipline`, `SportEquipmentType`, `SportCondition`, `RealEstateType`, `RealEstateAdType`, `HeatingType`) must implement `Persistable<UUID>` and generate deterministic IDs via `UUID.nameUUIDFromBytes`.
  - Seed initializers (`*DataInitializer`) must perform idempotent upserts (updating `label`, parent foreign keys, and metadata such as `releaseYear`, `isLegacy`, `aliases`, `horsePower`, `engineCapacity`, `startYear`, `endYear` without creating duplicates).
  - `CatalogLegacyPruner` deletes stale rows missing from JSON only when no foreign key references them.
- **Composite Deduplication & Data-Driven Validation:**
  - `EnumReadService` must deduplicate hierarchical catalog items by composite parent keys (`brandId:typeId:name`, `modelId:name`, `generationId:name:fuelType`, `bookTypeId:name`, `disciplineId:name`), never by flat `name` alone.
  - Type-specific extra facts go through the shared attribute framework (`listing_attribute_definitions` seeded from `data/attributes/<type>.json`, values in `listings.attributes`, checked by `ListingAttributeValidator`), not new columns; catalog-leaf facts go in the leaf's `specs` JSONB as `CATALOG`-level keys.
  - Both backend validators and frontend forms (`*Config.js`) must derive category behavior dynamically from catalog metadata (`clothingTypes[].group`, `realEstateTypes[].category`, `sportEquipmentTypes[].disciplineId`, `electronicModels[].aliases`), never from hardcoded type name lists.

## 4. Frontend API & React Query State Discipline
- **Central HTTP Client:** All frontend API calls go through `secondhand-frontend/src/common/services/api/request.js` with endpoint constants in `common/constants/apiEndpoints.js` (verify parity via `python3 scripts/check_api_endpoints.py`).
- **React Query Only for Server State:** Use `useQuery` / `useMutation`. Never call `axios` or `fetch` inside `useEffect`, and never copy server query results into `useState` or React Context.
- **Query Key Constants & Cache Updates:** Define domain query key arrays once per module (e.g., `ORDER_QUERY_KEYS`). After a mutation, call `setQueryData` when the response returns the updated resource, or `invalidateQueries` on both detail and list keys (including cross-cutting keys such as favorites on `ListingCard`).
- **Shared Hooks & Feedback:** Consume catalog enums from `useEnums.js` (single cached query), locations from `useLocationOptions`, and show user notifications via `NotificationContext` (never native `alert()` or `confirm()`).
