# Social Proof, Live Interest, and Urgency Metrics Architecture

## 1. Overview & Business Rationale

In modern marketplace platforms (such as Booking.com, Airbnb, Trendyol, and Amazon), **Social Proof** (Sosyal Kanıt) and **Live Urgency** (Satın Alma Aciliyeti) metrics significantly increase conversion rates by providing transparency into real-time listing demand.

This document outlines the end-to-end multi-tier caching, Redis presence tracking, stock hold guarantees, and frontend consumption rules for all live interest metrics in the SecondHand platform.

---

## 2. Metrics Architecture Matrix

| Metric | Source of Truth | Sliding Window / TTL | Frontend Caching | Display Location | UI Representation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Active Viewers** | Redis ZSET (`v4:listing:active_viewers:{id}`) | **24 Hours** (ZSET TTL: 26h) | 10 Minutes (`staleTime: 10m`) | `ListingDetailPage`, `ListingCard` | `🔥 Son 24 saatte X kişi inceledi`<br>`👁 X inceliyor` |
| **Cart / Checkout Intent** | PostgreSQL `Cart` + Redis Lua Reservation | **Active Cart / 15-min TTL** | 10 Minutes (`staleTime: 10m`) | `ListingDetailPage`, `ListingCard` | `🔥 Şu an X kişinin sepetinde / satın alma adımında.`<br>`🔥 X sepette` |
| **Total Favorites** | PostgreSQL `favorites` + Redis (`user:stats:favorites`) | **12 Hours** (Redis Cache TTL) | Page Mount + Optimistic Toggle | `ListingDetailPage`, `ListingCard` | `📍 Konum • 📅 Tarih • ❤️ X favori` |
| **Checkout Stock Reservation** | Redis Atomic Lua Script (`v4:inventory:reservation:...`) | **15 Minutes** (900s TTL) | Real-time countdown + `sessionStorage` | `CheckoutPage` | `⏳ Kalan Süre: 14:59` (Refreshte sıfırlanmaz) |

---

## 3. Detailed Component Implementations

### 3.1. Active Viewers (Redis Presence Tracking)

When any user (authenticated or anonymous) views a listing, `POST /api/v1/listings/{id}/view` is dispatched asynchronously:

1. **Unique Identifier Extraction:**
   ```java
   String dedupIdentifier = (userId != null) ? "u:" + userId 
       : ((sessionId != null && !sessionId.isBlank()) ? "s:" + sessionId 
       : "ip:" + ipHash);
   ```
2. **Redis ZSET Presence (24-Hour Sliding Window):**
   * **Key:** `v4:listing:active_viewers:{listingId}`
   * **Score:** Current Unix epoch timestamp in milliseconds (`System.currentTimeMillis()`)
   * **Value:** `dedupIdentifier`
   * **TTL:** 26 hours (auto-expires if no views occur).
3. **Deduplication:**
   * Because Redis ZSET members are unique, if the same user/session refreshes or revisits the listing 50 times in a day, only their timestamp score is updated—they are **always counted as 1 unique person**.
4. **Retrieval (`GET /api/v1/listings/{id}/active-viewers`):**
   * Cleans entries older than 24 hours via `ZREMRANGEBYSCORE(key, 0, now - 24h)`.
   * Returns `ZCARD` in ~0.1 ms directly from Redis RAM.

---

### 3.2. Cart & Checkout Intent

1. **Cart Reservations (`CartService.java`):**
   * When an item is in a user's active cart, `reservedAt` and `reservationEndTime` are maintained within the cart configuration window.
   * `countActiveReservationsByListing` counts all active cart holders regardless of inventory threshold constraints.
2. **Checkout Atomic Hold (`CheckoutStockReservationService.java`):**
   * Upon entering checkout, `POST /api/checkout/initiate` executes an atomic Redis Lua script (`reserve_stock_with_ttl.lua`) with a 15-minute (900s) TTL.
   * **Refresh Preservation:** If the user refreshes `CheckoutPage`, the Lua script recognizes the existing reservation and **does not reset the remaining TTL to 15:00**.
   * The API returns `remainingTtlSeconds`, and `CheckoutPage` seamlessly continues its countdown without restarting.

---

### 3.3. Total Favorites & 12-Hour Tiered Caching

1. **Backend Cache Tier (`CacheConfig.java`):**
   * Redis cache name: `user:stats:favorites`
   * **TTL:** **12 Hours (`Duration.ofHours(12)`)**.
   * Batch query optimization via `FavoriteStatsService.getFavoriteStatsForListings` attaches favorite count and user favorite status during listing DTO enrichment in a single round-trip.
2. **Frontend Header Placement (`ListingDetailPage.jsx`):**
   * Positioned cleanly in the metadata row right below the listing title:
     ```
     📍 Kadıköy, İstanbul  •  📅 25 Ağustos 2026  •  ❤️ 18 favori
     ```
3. **Zero-Lag Optimistic Updates:**
   * Clicking the favorite button optimistically toggles the heart icon and increments/decrements the count instantly (`0 ms UI latency`).

---

## 4. Frontend Polling & Caching Rules (Anti-Spam Strategy)

To prevent the **N+1 Polling Antipattern** where multiple cards on a grid bombard the backend with periodic requests:

1. **`ListingCard.jsx` (Grid / Showcase / Search):**
   * `enablePolling: false` (Background polling is completely disabled).
   * `staleTime: 10 * 60 * 1000` (10 minutes in-memory cache via React Query).
   * Renders static/cached social badges (`🔥 X sepette` or `👁 X inceliyor`).
2. **`ListingDetailPage.jsx` (Active Listing):**
   * `enablePolling: true`, `pollInterval: 10 * 60 * 1000` (refreshes at most once every 10 minutes).
   * `refetchOnWindowFocus: false` to avoid spike loads on tab switches.
3. **Urgency Banner Hierarchy:**
   * **Priority 1 (Cart/Checkout):** `🔥 Şu an X kişinin sepetinde / satın alma adımında.`
   * **Priority 2 (24h Viewers):** `🔥 Son 24 saatte X kişi bu ilanı inceledi.`

---

## 5. API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/listings/{id}/view` | Public | Asynchronously records unique listing view and Redis 24h presence. |
| `GET` | `/api/v1/listings/{id}/active-viewers` | Public | Returns `{ count: X }` of unique viewers in the last 24 hours. |
| `GET` | `/api/v1/cart/reservations/count/{listingId}` | Public | Returns `{ count: X }` of active cart reservations. |
| `POST` | `/api/checkout/initiate` | Authenticated | Holds stock in Redis and returns `{ reserved: {...}, remainingTtlSeconds: 540 }`. |
| `DELETE` | `/api/checkout/reservation/{listingId}` | Authenticated | Releases held stock in Redis if user cancels or navigates away. |
