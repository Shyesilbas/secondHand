# Skeleton and Empty State Inventory

## Skeleton Usages (animate-pulse, [...Array(x)])
1. **src/campaign/pages/MyCouponsPage.jsx**
   - Line 173: `{[1, 2, 3, 4].map(n => <div key={n} className="... animate-pulse" />)}`
2. **src/listing/components/ListingGrid.jsx**
   - Line 29: `{[...Array(8)].map((_, index) => <div className="... animate-pulse" />)}`
3. **src/listing/components/ListingsSkeleton.jsx**
   - Line 5-6: `{[...Array(8)].map((_, index) => <div className="... animate-pulse" />)}`
4. **src/listing/components/SimilarListings.jsx**
   - Line 51: `{[1, 2, 3, 4].map(idx => <div className="... animate-pulse" />)}`
5. **src/listing/pages/ListingDetailPage.jsx**
   - Lines 64, 69, 72: loading skeleton panels using `animate-pulse`.
6. **src/reviews/components/ReviewsList.jsx**
   - Line 18: `}).map((_, index) => <div className="... animate-pulse" />)`
7. **src/showcase/components/MyShowcasesPanel.jsx**
   - Line 155: `{[1, 2].map(i => <div className="... animate-pulse" />)}`
8. **src/reviews/components/ReviewStats.jsx**
   - Line 19: Container with `animate-pulse` fallback.
9. **src/reviews/components/ListingReviewStats.jsx**
   - Lines 14, 15: Star/text blocks with `animate-pulse`.
10. **src/cart/pages/ShoppingCartPage.jsx**
    - Line 265: `{[...Array(4)].map((_, i) => <div className="... animate-pulse" />)}`
11. **src/audit/pages/SecurityPage.jsx**
    - Line 129: `const LoadingSkeleton = () => <div className="... animate-pulse" />`
12. **src/forum/components/ThreadCard.jsx**
    - Line 30: Thread card layout with `animate-pulse`.
13. **src/forum/components/CommentItem.jsx**
    - Line 11: Comment item flex block with `animate-pulse`.
14. **src/forum/components/ThreadDetail.jsx**
    - Line 7: `ThreadDetailSkeleton` using `animate-pulse`.
15. **src/dashboard/pages/SellerDashboardPage.jsx**
    - Line 136: Suspense fallback with `animate-pulse`.
16. **src/dashboard/pages/BuyerDashboardPage.jsx**
    - Line 123: Suspense fallback with `animate-pulse`.
17. **src/complaint/pages/ComplaintsPage.jsx**
    - Line 49: `{[...Array(6)].map((_, i) => <div className="... animate-pulse" />)}`
18. **src/common/components/layout/Footer.jsx**
    - Lines 58, 134: Links loading placeholders with `[...Array(4)]` and `[...Array(3)]` using `animate-pulse`.
19. **src/user/pages/AccountHubPage.jsx**
    - Line 164: `{[1, 2].map(i => <div className="... animate-pulse" />)}`
20. **src/user/pages/UserProfilePage.jsx**
    - Lines 280, 316: Skeletons using `[...Array(8)]` / `[...Array(3)]` and `animate-pulse`.
21. **src/user/components/UserStats.jsx**
    - Line 27: Stats card loading fallback with `animate-pulse`.
22. **src/user/components/UserReviews.jsx**
    - Line 263: Reviews list skeleton using `[...Array(4)]` and `animate-pulse`.
23. **src/agreements/pages/AgreementsList.jsx**
    - Line 110: `{[...Array(3)].map((_, i) => <div className="... animate-pulse" />)}`
24. **src/favorites/pages/FavoritesPage.jsx**
    - Line 118: `{[...Array(4)].map((_, i) => <div className="... animate-pulse" />)`
25. **src/offer/pages/OffersPage.jsx**
    - Line 213: `{[...Array(3)].map((_, i) => <div className="... animate-pulse" />)`
26. **src/payments/components/PaymentHistory.jsx**
    - Line 111: `{[...Array(6)].map((_, i) => <div className="... animate-pulse" />)`
27. **src/payments/components/PaymentPanel.jsx**
    - Lines 40-42: Small skeleton lines with `animate-pulse`.
28. **src/favoritelist/pages/FavoriteListDetailPage.jsx**
    - Line 100: `{[...Array(4)].map((_, i) => <div className="... animate-pulse" />)` (implied skeleton detail)
29. **src/home/components/GreatSellersSection.jsx**
    - Line 113: `{[...Array(8)].map((_, i) => <div className="... animate-pulse" />)`
30. **src/home/components/ShowcaseSection.jsx**
    - Line 119: `{[...Array(12)].map((_, i) => <div className="... animate-pulse" />)`

## Empty States (empty, no result, bulunamadı, henüz yok)
1. **src/cart/pages/CheckoutPage.jsx**
   - Lines 171-184: Custom empty shopping cart div.
2. **src/cart/pages/ShoppingCartPage.jsx**
   - Lines 231-282: Multiple custom empty state boxes.
3. **src/listing/components/ListingGrid.jsx**
   - Lines 50, 60: EmptyState components already imported.
4. **src/common/components/search/SearchResults.jsx**
   - Line 141: Compact EmptyState for empty searches.
5. **src/user/pages/UserProfilePage.jsx**
   - Lines 287, 323: Reusable/local EmptyState instances.
6. **src/showcase/components/BulkSelectionModal.jsx**
   - Lines 95-100: Custom search empty results layout.
7. **src/listing/components/ListingsContent.jsx**
   - Lines 34-59: Custom search/no category listings empty results layout.
8. **src/campaign/pages/MyCouponsPage.jsx**
   - Lines 174-183: Custom no coupons empty state layout.
