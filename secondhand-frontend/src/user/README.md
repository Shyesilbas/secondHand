# User & Account Hub UI Module

User profile management, public seller storefronts, multi-address book CRUD, phone verification, and account badge indicators.

---

## 1. Overview & Purpose

The `user` module serves as the primary account hub and personal identity center for the application. It handles both private account management and public seller reputation:
1. **Unified Account Hub:** Centralized settings navigation (`AccountHubPage`) orchestrating personal profile, address book, security sessions, eWallet configuration, complaint histories, and legal contracts.
2. **Public Seller Storefront:** Community-facing seller page (`UserProfilePage`) rendering seller reputation stats, Great Seller qualification badges (`UserProfileHeader`), active listings catalog (`useUserListings`), and customer feedback (`UserReviews`).
3. **Multi-Address Book:** Comprehensive shipping and billing address CRUD (`AddressList`, `AddressForm`, `AddressCard`) with default address designation.
4. **Security-Gated Profile Updates:** Sensitive updates (such as telephone number changes) mandate current password re-authentication.

---

## 2. Route Map & Entry Points

| Route | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| `/account` | `ProtectedRoute` | `AccountHubPage` | Central account portal with tabbed or sectioned navigation (`accountHubSections.js`). |
| `/profile` | `ProtectedRoute` | `ProfilePage` | Private personal profile overview (`ProfileHeader`, `ProfilePersonalInfo`, `AddressList`). |
| `/users/:userId` | Public | `UserProfilePage` | Public seller profile view with active listings, Great Seller badge, and customer reviews. |

---

## 3. Component Hierarchy & Core Sub-Components

```
user/
├── pages/
│   ├── AccountHubPage.jsx             # Unified account dashboard layout
│   ├── ProfilePage.jsx                # Private user settings and account overview
│   └── UserProfilePage.jsx            # Public seller storefront and reputation viewer
├── components/
│   ├── ProfileHeader.jsx              # Private profile hero with avatar, tier badge, and stats
│   ├── UserProfileHeader.jsx          # Public seller banner with trust score and badges
│   ├── ProfilePersonalInfo.jsx        # Editable personal details form (name, email, phone)
│   ├── ProfileAccountStatus.jsx       # Account tier, membership status, and verification tags
│   ├── ProfileQuickActions.jsx        # Navigation shortcuts to orders, eWallet, and listings
│   ├── UserReviews.jsx                # Tabbed reviews list embedded on public seller page
│   └── address/
│       ├── AddressList.jsx            # Address cards grid with add/edit actions
│       ├── AddressCard.jsx            # Individual address display with default badge
│       └── AddressForm.jsx            # Modal dialog form for address creation and editing
├── hooks/
│   ├── useAddresses.js                # React Query CRUD operations for user addresses
│   ├── usePhoneUpdate.js              # Password-confirmed phone update mutation
│   ├── useUserListings.js             # Paginated active listings published by a seller
│   └── useGreatSellerStatus.js        # Reputation score and seller trust badge evaluator
├── services/
│   ├── userService.js                 # REST client for /v1/users and /v1/addresses
│   ├── userBadgesService.js           # REST client for unread / action badge counters
│   └── userSearchService.js           # Seller directory and member lookup API
├── utils/
│   └── accountHubSections.js          # Navigation metadata for Account Hub categories
├── userConstants.js                   # Default page limits and error messages
├── users.js                           # UserDTO definitions and data transformers
└── index.js                           # Module exports
```

### Component Roles & Invariants
- **Password-Gated Mutations:** In `usePhoneUpdate`, updating the registered mobile number requires explicit password re-verification via `POST /v1/users/phone` to prevent account takeover.
- **Address Book Synchronization:** Adding, modifying, or deleting an address invalidates `['user', 'addresses']`, synchronizing immediately with the checkout shipping selector.
- **Sanitized Cache Storage:** Profile updates invalidate `['user', 'me']` and update sanitized public fields in `tokenStorage.js` without persisting raw credentials.

---

## 4. State Management & React Query Contract

### Query Keys & Cache Matrix
| Query Key | Scope | Stale Time | Garbage Collection | Invalidation Triggers |
|---|---|---|---|---|
| `['user', 'me']` | Current authenticated user profile | 5 min (`300000ms`) | 15 min (`900000ms`) | Profile update, phone change, avatar update |
| `['user', 'addresses']` | User address book list | 2 min (`120000ms`) | 10 min (`600000ms`) | Address created, edited, deleted, or set default |
| `['user', userId, 'listings']` | Public seller active listings | 1 min (`60000ms`) | 5 min (`300000ms`) | Listing status changes |
| `['greatSellerStatus', userId]` | Seller trust & reputation badge | 5 min (`300000ms`) | 15 min (`900000ms`) | Order review completion |
| `['user', 'badges']` | Action badge counts (orders, chat) | 30 sec (`30000ms`) | 2 min (`120000ms`) | WebSocket events or order updates |

### Hooks Contract
- `useAddresses()`: Returns `{ addresses, isLoading, error, addAddress, updateAddress, deleteAddress, setDefaultAddress }`.
- `usePhoneUpdate()`: Returns `{ updatePhone, isLoading, error, isSuccess }`.
- `useGreatSellerStatus(userId)`: Returns `{ isGreatSeller, completionRate, averageRating, totalOrders }`.

---

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

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** `ProfilePage` and `UserProfilePage` render avatar skeletons and stat card skeleton placeholders.
2. **Empty State:** `AddressList` displays an empty postal card with a prompt to add a shipping address for faster checkout.
3. **Error State:** Field errors appear beneath form inputs; network failures render standard retry alerts.
4. **Data State:** Rich profile view with verified seller status, contact details, and registered addresses.

### Backend Error Contract
- Handled through `useNotification` toasts and inline form messages.
- Known error codes:
  - `INVALID_PASSWORD`: Displayed when phone update re-authentication fails.
  - `PHONE_ALREADY_IN_USE`: Alert when attempting to bind a phone number registered to another user.
  - `ADDRESS_NOT_FOUND`: Target address does not exist or does not belong to user.

### Restrained Design Tokens
- **Seller Badges:** Great Seller badge uses subdued emerald tint (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`), avoiding flashy golden trophies.
- **Avatar:** Neutral rounded container (`rounded-full bg-surface-alt text-muted-foreground border-border`).
- **Cards & Buttons:** Strict adherence to `rounded-md` radius tokens.
