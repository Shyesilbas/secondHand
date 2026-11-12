# Reviews UI Module

Star ratings, aggregate seller reputation statistics, verified buyer feedback, and order-item review submission dialogs.

---

## 1. Overview & Purpose

The `reviews` module provides a comprehensive trust and reputation system across the marketplace. Reviews can only be submitted by verified buyers who completed an order item transaction (via order delivery confirmation). The module handles:
1. **Seller Reputation Profiles:** Paginated displays of reviews received by or written by a user (`UserReviewsPage`).
2. **Listing Detail Integration:** Embedded review summaries and breakdowns inside product pages (`ListingReviewsSection`).
3. **Verified Purchase Reviews:** Submission modal with mandatory 1-to-5 star rating and optional textual feedback (`ReviewModal`).
4. **Aggregate Rating Statistics:** Rating average calculations, distribution counts, and percentage bar indicators (`ReviewStats`).

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/reviews/received/:userId` | Public | `UserReviewsPage` | Displays all verified reviews received by the targeted user as a seller. |
| `/reviews/given/:userId` | Public | `UserReviewsPage` | Displays all reviews authored and submitted by the targeted user as a buyer. |
| In-Modal / Embedded | `ProtectedRoute` | `ReviewModal` | Triggered via `ReviewButton` on completed order items to capture ratings. |
| Embedded Section | Public | `ListingReviewsSection` | Embedded within `/listings/:id` to render listing-specific or seller feedback. |

---

## 3. Component Hierarchy & Core Sub-Components

```
reviews/
├── pages/
│   └── UserReviewsPage.jsx            # Main route for received/given review streams
├── components/
│   ├── ListingReviewsSection.jsx      # Embedded widget for product detail pages
│   ├── ReviewModal.jsx                # Submission dialog with star picker and comment input
│   ├── ReviewsList.jsx                # Infinite / paged list container with skeleton loaders
│   ├── ReviewCard.jsx                 # Individual review item with author avatar and date
│   ├── ReviewStats.jsx                # Summary header with average score and rating breakdown
│   ├── RatingStarsDisplay.jsx         # Read-only star rendering with ceiling/rounding
│   ├── InteractiveStarRating.jsx      # Hover-reactive 1-5 star input selector
│   ├── ReviewButton.jsx               # Action button on order item cards
│   └── StarIcon.jsx                   # Low-level SVG star path renderer
├── hooks/
│   ├── useReviews.js                  # Infinite and paged query hooks for received/written reviews
│   └── useReviewSubmission.js         # Mutation hook handling submission, loading, and errors
├── services/
│   └── reviewService.js               # REST client for /v1/reviews endpoints
├── utils/
│   ├── reviewDateFormat.js            # Relative / localized review timestamp formatting
│   ├── reviewError.js                 # API error message normalization
│   └── reviewListingGrouping.js       # Grouping reviews by listing or category
└── reviewConstants.js                 # Rating limits, pagination defaults, and static messages
```

### Component Roles & Invariants
- **`StarIcon` Invariant:** Low-level SVG paths live exclusively in `StarIcon`. All UI consumers use either `InteractiveStarRating` (interactive input) or `RatingStarsDisplay` (read-only display).
- **`ReviewButton` Decoupling:** `ReviewButton` never initiates a fetch query itself; the parent order item passes `existingReview` and refetches order item status upon completion.
- **`ReviewStats` Calculation:** Supports server-provided aggregate stats or memoized client-side distribution computation when rendering given reviews.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['reviews', 'received', userId, size]` | User received reviews infinite stream | 5 min (`300000ms`) | 15 min (`900000ms`) | Review creation on user order item |
| `['reviews', 'received', 'paged', userId, page, size]` | Paginated profile reviews | 5 min (`300000ms`) | 15 min (`900000ms`) | Page size change or explicit refetch |
| `['reviews', 'written', userId, size]` | User submitted reviews stream | 5 min (`300000ms`) | 15 min (`900000ms`) | Successful `createReview` mutation |
| `['reviewStats', userId]` | Seller aggregate ratings and counts | 5 min (`300000ms`) | 15 min (`900000ms`) | Successful `createReview` mutation |

### Hooks Contract
- `useReviews(userId, options)`: Returns `{ reviews, loading, error, pagination, refetch, hasMore, loadMore, handlePageSizeChange }` using React Query `useInfiniteQuery`.
- `usePagedUserReceivedReviews(userId, options)`: Returns standard Spring Page metadata `{ reviews, loading, isFetching, error, pagination, loadPage, handlePageSizeChange, refetch }` with `placeholderData: keepPreviousData`.
- `useReviewsByUser(userId, options)`: Infinite scroll hook for reviews written by the active user.
- `useUserReviewStats(userId, options)`: Provides aggregate `{ averageRating, totalReviews, ratingCounts }`.
- `useReviewSubmission()`: Encapsulates `{ submitReview, loading, error, setError, clearError }`.

---

## 5. Form & Data Validation Rules

Review creation forms strictly enforce the constraints defined in `REVIEW_LIMITS`:
- **Rating Range:** `MIN_RATING = 1`, `MAX_RATING = 5`. Submissions with rating `< 1` are blocked before network dispatch with error message `"Please rate the product before submitting a review"`.
- **Comment Length:** Maximum 1,000 characters (`REVIEW_LIMITS.MAX_COMMENT_LENGTH`). Trimmed automatically before payload creation; whitespace-only strings resolve to `null`.
- **Eligibility:** Verified on backend via `orderItemId`. Users cannot review products they have not purchased or orders that have not completed delivery.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `ReviewsList` renders 3 animated skeleton rows (`SKELETON_ROWS = 3`) matching the card dimensions; star icons pulse with `bg-surface-alt`.
2. **Empty State:** Clean empty card displaying `"No reviews yet"` (`REVIEW_MESSAGES.NO_REVIEWS_YET`) with a neutral star icon outline, avoiding celebratory or depressing visual clutter.
3. **Error State:** Renders inline error card with an alert icon, localized error text, and a `"Try Again"` retry button bound directly to `refetch`.
4. **Data State:** Ordered chronological stream of review cards featuring verified purchase badges, numerical ratings, star bars, and formatted timestamps.

### Backend Error Contract
- **`ProblemDetail` / Result Responses:** Handled via `getReviewErrorMessage(err)`.
- **Known Backend Codes:**
  - `REVIEW_ALREADY_EXISTS`: Displayed when attempting duplicate submission for the same order item.
  - `ORDER_ITEM_NOT_DELIVERED`: Notifies buyer that review submission is locked until the courier delivers the package or QR meetup completes.
  - `UNAUTHORIZED_REVIEW`: Prevented when buyer identity does not match order recipient.

### Restrained Design Tokens
- **Borders & Dividers:** `border-border` and `divide-border` on neutral cards.
- **Card Backgrounds:** `bg-surface` with `hover:bg-surface-alt/50` transition.
- **Star Palette:** Active stars use restrained amber/yellow (`text-amber-500 fill-amber-500`), inactive stars use muted slate (`text-muted-foreground/30 fill-transparent`). No neon glowing effects.
- **Corner Radii:** Strict adherence to `rounded-md` on cards and `rounded-sm` on star badges.
