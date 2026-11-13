# Reviews UI Module

Star ratings, aggregate seller reputation statistics, verified buyer feedback, and order-item review submission dialogs.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`review`](../../../src/main/java/com/serhat/secondhand/review/README.md)
> - **Architecture Deep Dive:** [`docs/social-proof-and-urgency-metrics-architecture.md`](../../../docs/social-proof-and-urgency-metrics-architecture.md)

## 1. Overview & Purpose

The `reviews` module provides a comprehensive trust and reputation system across the marketplace. Reviews can only be submitted by verified buyers who completed an order item transaction (via order delivery confirmation). The module handles:
1. **Seller Reputation Profiles:** Paginated displays of reviews received by or written by a user (`UserReviewsPage`).
2. **Listing Detail Integration:** Embedded review summaries and breakdowns inside product pages (`ListingReviewsSection`).
3. **Verified Purchase Reviews:** Submission modal with mandatory 1-to-5 star rating and optional textual feedback (`ReviewModal`).
4. **Aggregate Rating Statistics:** Rating average calculations, distribution counts, and percentage bar indicators (`ReviewStats`).

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/reviews/given/:userId` | `UserReviewsPage` | Protected |
| `/reviews/received/:userId` | `UserReviewsPage` | Protected |
| `/users/:userId/reviews` | `UserReviewsPage` | Protected |

| Embedded entry | Where |
|---|---|
| `ReviewModal` | Triggered via `ReviewButton` on completed order items to capture ratings. |
| `ListingReviewsSection` | Embedded within `/listings/:id` to render listing-specific or seller feedback. |

## 3. Component Rules

- **`StarIcon` Invariant:** Low-level SVG paths live exclusively in `StarIcon`. All UI consumers use either `InteractiveStarRating` (interactive input) or `RatingStarsDisplay` (read-only display).
- **`ReviewButton` Decoupling:** `ReviewButton` never initiates a fetch query itself; the parent order item passes `existingReview` and refetches order item status upon completion.
- **`ReviewStats` Calculation:** Supports server-provided aggregate stats or memoized client-side distribution computation when rendering given reviews.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `REVIEW_KEYS.received(userId, currentSize)` | `useReviews.js` |
| `REVIEW_KEYS.receivedPaged(userId, page, size)` | `useReviews.js` |
| `REVIEW_KEYS.stats(userId)` | `useReviews.js` |
| `REVIEW_KEYS.written(userId, pageSize)` | `useReviews.js` |

## 5. Form & Data Validation Rules

Review creation forms strictly enforce the constraints defined in `REVIEW_LIMITS`:
- **Rating Range:** `MIN_RATING = 1`, `MAX_RATING = 5`. Submissions with rating `< 1` are blocked before network dispatch with error message `"Please rate the product before submitting a review"`.
- **Comment Length:** Maximum 1,000 characters (`REVIEW_LIMITS.MAX_COMMENT_LENGTH`). Trimmed automatically before payload creation; whitespace-only strings resolve to `null`.
- **Eligibility:** Verified on backend via `orderItemId`. Users cannot review products they have not purchased or orders that have not completed delivery.
