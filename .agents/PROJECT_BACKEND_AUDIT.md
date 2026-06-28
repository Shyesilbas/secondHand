# Backend Audit Report: secondHand Project

This report provides a comprehensive architectural and performance analysis of the `secondHand` backend system, focusing on database connection/query efficiency, caching alignment, transactional boundaries, API integration safety, and configuration practices.

---

## 1. General Assessment & Class Map

The codebase is built on **Spring Boot 3.5.4** and **Java 17** using a modular structure containing domains like `auth`, `payment`, `ewallet`, `escrow`, `order`, `listing`, `chat`, and `ai`. 
The architecture follows a Clean/Layered model: `controller -> service -> validator -> repository -> mapper`. 

### Key Architectural Strength
- **Map-Fetch Integrity:** Custom list/page query filters in `ListingRepository` utilize `@EntityGraph(attributePaths = {"seller"})` to load parent records, effectively eliminating N+1 select queries during DTO mapping.
- **Optimistic Locking:** Core payment flows use retry mechanisms around optimistic lock exceptions.
- **Pessimistic Locking:** Critical updates on Escrows and EWallets use `PESSIMISTIC_WRITE` database locks to prevent concurrent race conditions.

---

## 2. Detected Issues Matrix

| Issue | Class/Layer | Risk | Proposed Solution |
| :--- | :--- | :--- | :--- |
| **`enable_lazy_load_no_trans: true` Anti-Pattern** | `application-core.yml` | **High Performance & Resource Risk:** Hides LazyInitializationExceptions but silently opens/closes separate database connections per lazy association during serialization. Leads to connection pool exhaustion under concurrent load. | Disable this flag, and rely on explicit `JOIN FETCH` queries, `@EntityGraph`, or map-level mappings. |
| **Cache Collision & Inefficient Purging** | `CacheConfig.java` / `ListingQueryService.java` | **Medium Caching Risk:** The cache name `userProfile` stores both `UserDto` and `CachedPage<ListingDto>`. Updating any listing purges the entire cache, wiping all active user details globally. | Separate into two caches: `userProfile` (TTL 15m) and `userListings` (TTL 10m). Only evict `userListings` on listing changes. |
| **RestTemplate Timeouts Missing** | `GeminiClient.java` / `ExchangeRateService.java` | **High Reliability Risk:** Defaults to infinite socket and connection timeouts. Slow or hanging external APIs (Gemini/Exchange API) will block threads indefinitely, causing server crash. | Set connection (5s) and read (30s) timeouts on `RestTemplate` using `SimpleClientHttpRequestFactory`. |
| **Lack of Cache for Exchange Rates** | `ExchangeRateService.java` | **Medium Performance Risk:** Every conversion request to `/api/v1/exchange-rates/{from}/{to}` initiates a fresh HTTP call to exchangerate-api, increasing latency and hitting rate limits. | Add `@Cacheable(value = "exchangeRates", key = "#from + '_' + #to")` with a TTL of 2-6 hours. |
| **Transactional N+1 in Loops** | `PriceDropNotificationListener.java` | **High Database Strain:** Loops through favorited users and calls `@Transactional` `notificationService.createAndSend` sequentially. Opens/commits a separate transaction per user (up to hundreds), stalling the thread. | Implement `notificationService.createAndSendBulk(...)` to batch insert notifications inside a single transaction. |
| **Non-Idempotent Idempotency Keys** | `MembershipService.java` / `ShowcaseService.java` | **High Transaction Risk:** Constructs keys using `System.currentTimeMillis()` (e.g. `membership-upgrade-userId-timestamp`). Client retries will generate a new key, bypassing duplicate filters and causing double charges. | Generate keys deterministically (e.g. `membership-autorenew-userId-YYYYMMDD` or a unique Client UUID passed in headers). |
| **Missing Transaction Boundary on Token Refresh** | `LoginService.java` | **High Session Stability Risk:** `refreshToken` is not `@Transactional`. Under concurrent calls, checking validation and revoking families can desynchronize, causing token family lockout or partial db failures. | Annotate `LoginService.refreshToken(String)` with `@Transactional`. |
| **Swallowed Database Exceptions in E-Wallet** | `EWalletService.processEWalletPayment` | **Medium Stability Risk:** Catches database errors and returns `PaymentResult.failure`. Marks the outer transaction as rollback-only. Commitment then throws `UnexpectedRollbackException` to users (500 status code). | Let persistence/constraint exceptions bubble up or orchestrate them outside the active database transaction. |
| **Missing Database Indexes** | Entity Layer (`Email`, `Message`, `UserAgreement`, `ChatRoom`) | **High DB Indexing Risk:** No indexes defined on key FKs or search criteria, causing full-table scans when tables grow. | Add index mappings for frequently accessed query paths. |

---

## 3. Detailed Technical Analysis

### A. Caching Conflict (`userProfile`)
In `ListingQueryService.java` (line 149):
```java
@Cacheable(value = "userProfile", key = "'listings:' + #userId + ':' + #page + ':' + #size")
public CachedPage<ListingDto> getCachedUserListings(...)
```
In `UserService.java` (line 151):
```java
@Cacheable(value = "userProfile", key = "#id")
public UserDto getCachedUserDto(...)
```
And in `AbstractListingService.java`:
```java
@CacheEvict(value = "userProfile", allEntries = true)
public void invalidateUserProfile(...) // Called on listing save/update/delete
```
* **Consequence:** Modifying a listing clears **all user details** from Redis.
* **Fix:** Use `@Cacheable(value = "userListings", ...)` for listing pages. Evict only `userListings` when user changes listings.

---

### B. Missing HTTP Connection & Read Timeouts
In `GeminiClient.java` (line 31) and `ExchangeRateService.java` (line 21):
```java
private final RestTemplate restTemplate = new RestTemplate();
```
* **Consequence:** When external networks or APIs slow down, threads wait indefinitely, saturating Tomcat thread pools and causing denial of service.
* **Fix:** 
```java
private final RestTemplate restTemplate;

public GeminiClient() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(5000);
    factory.setReadTimeout(30000);
    this.restTemplate = new RestTemplate(factory);
}
```

---

### C. Loop-Database N+1 Transaction Bottleneck
In `PriceDropNotificationListener.java` (line 45):
```java
for (User user : favoritedUsers) {
    notificationService.createAndSend(request); // @Transactional method
}
```
* **Consequence:** If 1000 users favorite a listing and it drops in price, 1000 separate database connection transactions are opened, executed, and committed sequentially.
* **Fix:** Introduce a bulk execution service:
```java
@Transactional
public void createAndSendBulk(List<NotificationRequest> requests) {
    List<Notification> entities = requests.stream().map(...).toList();
    notificationRepository.saveAll(entities);
    // Trigger bulk websockets...
}
```

---

### D. Session & Token Rotation Race Conditions
In `LoginService.java` (line 115):
```java
public LoginResponse refreshToken(String refreshTokenValue) { ... }
```
* **Consequence:** If a client retries token refresh concurrently, two separate HTTP requests execute the token rotation flow. Since `refreshToken` lacks `@Transactional`, the calls query `Token` tables independently. One call will revoke the token, causing the other call to trigger a false **Token Reuse Security Alert** and revoke the entire token family, forcing the user to log out.
* **Fix:** Add `@Transactional` to `LoginService.refreshToken(String)`.

---

### E. Missing Database Indexes
These high-growth tables currently lack indexes in their `@Table` configurations:
1. **`emails`:** Frequently queried using `user_id` and soft deleted.
   * *Fix:* Add `@Index(name = "idx_emails_user_deleted", columnList = "user_id, deleted_at")`.
2. **`messages`:** Frequently filtered by room and sorted by date.
   * *Fix:* Add `@Index(name = "idx_messages_room_created", columnList = "chat_room_id, created_at")`.
3. **`chat_room_participants`:** Bridging collection table.
   * *Fix:* Ensure foreign key indexes exist on `chat_room_id` and `user_id`.
4. **`user_agreements`:** Checked on every user login.
   * *Fix:* Add `@Index(name = "idx_user_agreements_lookup", columnList = "user_id, agreement_id")`.

---

## 4. Priority Recommendation Order

1. **[CRITICAL] Set RestTemplate Timeouts & Transactional on Token Refresh:**
   Prevent server hang/exhaustion due to third-party API issues, and eliminate false-logout token refresh conflicts.
2. **[CRITICAL] Repair Non-idempotent Keys & E-Wallet Swallowed Exceptions:**
   Fix the `System.currentTimeMillis()` suffix in payments and memberships to prevent double charging. Fix the swallowed exceptions to avoid JDBC UnexpectedRollbackExceptions.
3. **[HIGH] Resolve Cache Mismatch / Partitioning (`userProfile`):**
   Split the collided caches to preserve memory-hit ratios and reduce total Redis evictions.
4. **[HIGH] Add Database Indexes & Disable `enable_lazy_load_no_trans`:**
   Add required indexes on fast-growing tables (`messages`, `emails`). Disable the Hibernate anti-pattern to identify and fix hidden lazy connection leakage.
5. **[MEDIUM] Add Caching for Exchange Rates:**
   Reduce API response latency and avoid third-party pricing rate limits.
6. **[MEDIUM] Implement Bulk Notification Saving:**
   Refactor sequentially looped transaction updates into a single batch database transaction.
