# User & Account Hub UI Module

User profile management, public seller storefronts, multi-address book CRUD, phone verification, and account badge indicators.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`user`](../../../src/main/java/com/serhat/secondhand/user/README.md)
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](../../../docs/auth-jwt-and-security-architecture.md)
> - **Architecture Deep Dive:** [`docs/multi-tier-redis-caching-and-invalidation.md`](../../../docs/multi-tier-redis-caching-and-invalidation.md)

## 1. Overview & Purpose

The `user` module serves as the primary account hub and personal identity center for the application. It handles both private account management and public seller reputation:
1. **Unified Account Hub:** Centralized settings navigation (`AccountHubPage`) orchestrating personal profile, address book, security sessions, eWallet configuration, complaint histories, and legal contracts.
2. **Public Seller Storefront:** Community-facing seller page (`UserProfilePage`) rendering seller reputation stats, Great Seller qualification badges (`UserProfileHeader`), active listings catalog (`useUserListings`), and customer feedback (`UserReviews`).
3. **Multi-Address Book:** Comprehensive shipping and billing address CRUD (`AddressList`, `AddressForm`, `AddressCard`) with default address designation.
4. **Security-Gated Profile Updates:** Sensitive updates (such as telephone number changes) mandate current password re-authentication.

## 2. Route Map & Entry Points

| Path | Page | Access |
|---|---|---|
| `/dashboard` | `AccountHubPage` | Protected |
| `/profile` | `ProfilePage` | Protected |
| `/users/:userId` | `UserProfilePage` | Protected |

## 3. Component Rules

- **Password-Gated Mutations:** In `usePhoneUpdate`, updating the registered mobile number requires explicit password re-verification via `POST /v1/users/phone` to prevent account takeover.
- **Address Book Synchronization:** Adding, modifying, or deleting an address invalidates `['user', 'addresses']`, synchronizing immediately with the checkout shipping selector.
- **Sanitized Cache Storage:** Profile updates invalidate `['user', 'me']` and update sanitized public fields in `tokenStorage.js` without persisting raw credentials.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `ADDRESSES_QUERY_KEYS.byUser(user?.id)` | `useAddresses.js` |
| `['greatSellerStatus', userId]` | `useGreatSellerStatus.js` |
| `['listings', 'byUser', userId, page, size]` | `useUserListings.js` |
| `['myOrders', user?.id, 0, 5]` | `AccountHubPage.jsx` |
| `['reviews', 'received', 'all', profileUserId]` | `UserReviews.jsx` |
| `['users', 'profile', userId]` | `UserProfilePage.jsx` |

| Invalidated / updated key | By |
|---|---|
| `ADDRESSES_QUERY_KEYS.all` | `useAddresses.js` |
| `['addresses']` | `ProfilePage.jsx` |

## 5. Form & Data Validation Rules

### Address Form Rules (`AddressForm.jsx`)
- **Title:** Required label (e.g., "Home", "Office"), max 50 characters.
- **Address Line:** Required street and building details (minimum 10 characters).
- **City & District:** Required selected identifiers matching platform administrative regions.
- **Postal Code:** Valid 5-digit postal code.
- **Recipient Phone:** Valid 10-digit mobile number format.

### Phone Update Rules (`usePhoneUpdate.js`)
- Requires valid mobile number syntax.
- Mandatory current account password confirmation.
