# User Domain

## Purpose
The `user` domain manages user profiles, delivery/billing addresses, user badges, membership subscriptions (`BASIC`, `PLUS`, `PRO`), daily Aura AI quotas, and automated seller prestige eligibility ("Great Seller").

## Architecture Overview
- **UserService:** Profile management, credential verification, and safe public profile resolution.
- **AddressService:** Address lifecycle and single main-address resolution.
- **MembershipService & MembershipScheduler:** Manages subscription plans, auto-renewal cycles, and daily Aura AI quotas.
- **UserBadgeService & GreatSellerService:** Evaluates user metrics (ratings, completed orders, order volume) to assign prestige badges.
- **GreatSellerEligibilityEventListener:** Listens asynchronously to `SellerEligibilityRecheckEvent` to trigger badge recalculation.

## Business Invariants & Constraints
- **Unique Identifiers:** Email and phone numbers must be strictly unique across the system.
- **Main Address:** Only one address per user can be marked as the main address at any given time.
- **Public Profile Privacy:** `GET /api/v1/users/{id}` returns `PublicUserProfileDto` (id, name, surname, accountCreationDate, accountVerified) only; never expose email, phone, birthdate, gender, role, or account status there. `GET /api/v1/users/{id}/listings` returns only `ACTIVE` listings.
- **Badge Eligibility:** Great Seller status is resolved via `GreatSellerPolicy` using historical aggregate data, triggered event-driven on order/review completion.
- **Membership & Aura AI Quota:** Users are assigned `MembershipPlan` tiers (`BASIC`, `PLUS`, `PRO`). `daily_aura_questions_used` is tracked and resets daily; exceeded quota returns `403 AURA_LIMIT_EXCEEDED`. `MembershipScheduler` handles recurring billing renewals and downgrades.

## State Machines
- **Address Status:** Standard -> Main (demotes previously main address).
- **Membership Status:** Active -> Cancelled (expires at period end) -> Expired.

## Integration Points
- **Incoming:** HTTP requests via `UserController`, `AddressController`, `MembershipController`, and `UserBadgesController`.
- **Outgoing:** Listens to `order` and `review` events for badge re-evaluation. Used by `ai` domain for quota checking.

## Public APIs
- **User & Profile (`/api/v1/users`):**
  - `GET /api/v1/users/me`: Current user profile.
  - `GET /api/v1/users/{id}`: Safe public profile details.
  - `GET /api/v1/users/{user-id}/listings`: Active listings belonging to user.
  - `PUT /api/v1/users/email`: Updates authenticated user email.
  - `PUT /api/v1/users/phone`: Updates authenticated user phone number.
  - `POST /api/v1/users/verification/send`: Sends verification code.
  - `POST /api/v1/users/verification/verify`: Verifies code for account activation.
  - `GET /api/v1/users/great-sellers`: Lists great sellers.
  - `GET /api/v1/users/{user-id}/great-seller-status`: Great seller eligibility breakdown.
  - `GET /api/v1/users/{user-id}/reviews/received`: Reviews received by user.
  - `GET /api/v1/users/{user-id}/reviews/written`: Reviews written by user.
  - `GET /api/v1/users/{user-id}/review-stats`: Aggregated review rating statistics.
  - `GET /api/v1/users/me/reviews/received`: Authenticated user's received reviews.
  - `GET /api/v1/users/me/complaints`: Complaints filed by authenticated user.
  - `GET /api/v1/users/me/complaints/received`: Complaints filed against authenticated user.
  - `GET /api/v1/users/me/offers/made`: Offers created by authenticated user.
  - `GET /api/v1/users/me/offers/received`: Offers received by authenticated user.
  - `GET /api/v1/users/search`: Search users by term (admin).
  - `GET /api/v1/users/audit-logs`: User audit logs (admin).
- **Addresses (`/api/v1/users/addresses`):**
  - `GET /api/v1/users/addresses`: Lists saved addresses.
  - `POST /api/v1/users/addresses`: Adds a new address.
  - `PUT /api/v1/users/addresses/{id}`: Updates an existing address.
  - `DELETE /api/v1/users/addresses/{id}`: Deletes an address.
  - `POST /api/v1/users/addresses/{id}/main`: Sets address as primary.
- **Memberships (`/api/v1/memberships`):**
  - `GET /api/v1/memberships/status`: Returns plan details, auto-renew status, and daily Aura AI quota usage.
  - `POST /api/v1/memberships/upgrade`: Upgrades or modifies subscription tier.
  - `POST /api/v1/memberships/cancel`: Cancels auto-renewal for current subscription.
  - `POST /api/v1/memberships/toggle-auto-renew`: Toggles auto-renewal status.
- **Badges (`/api/v1/user/badges`):**
  - `GET /api/v1/user/badges`: Returns earned prestige badges for current user.
