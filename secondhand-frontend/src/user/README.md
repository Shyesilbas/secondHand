# User & Account Hub UI Module

User profile management, public seller profiles, multi-address book CRUD, phone verification, and account badge indicators.

## Architecture

- **`AccountHubPage`:** Unified settings portal organizing navigation sections (`accountHubSections.js`): personal information, address management, security activity, eWallet settings, complaints, and platform agreements.
- **`ProfilePage`:** Authenticated user's profile view combining `ProfileHeader`, `ProfilePersonalInfo`, `ProfileAccountStatus`, and `AddressList`.
- **`UserProfilePage`:** Public profile rendered for sellers, displaying seller metrics, Great Seller badge qualification (`UserProfileHeader`), paginated active listings (`useUserListings`), and customer ratings (`UserReviews`).
- **Address Management:**
  - `AddressList`, `AddressCard`, `AddressForm`: Modal and card components managing shipping and billing addresses.
  - `useAddresses`: React Query hook executing address mutations (`add`, `update`, `delete`, `setDefault`) against `/v1/addresses/*`.
- **Phone & Verification:**
  - `usePhoneUpdate`: Hook managing phone number updates via `/v1/users/phone`, requiring current password verification to prevent unauthorized account changes.
- **Badges & Reputation:**
  - `userBadgesService`: Aggregates badge counts (`/v1/user/badges`) for pending orders, unread messages, and notifications.
  - `useGreatSellerStatus`: Evaluates eligibility rules and badge indicators for trustworthy sellers (`/v1/users/{id}/great-seller-status`).

## Invariants

- **Password Protected Mutations:** Updating phone numbers or security settings requires re-entering the current password.
- **Cache Synchronization:** Address mutations immediately invalidate `['user', 'addresses']` and cascade to checkout address selectors.
- **Sanitized Profile State:** User profile updates invalidate `['user', 'me']` and update sanitized profile cache in `tokenStorage.js` without persisting raw credentials.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: neutral avatar placeholders, status badges with subtle tints, and zero decorative emojis.

