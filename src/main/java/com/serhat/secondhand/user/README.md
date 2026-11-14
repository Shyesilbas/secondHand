# User Domain

Manages user accounts (`users` table), sanitized public vs. private profiles, shipping/billing addresses (`addresses` table), membership subscriptions (`MembershipPlan`: `BASIC`, `PLUS`, `PRO`), Great Seller prestige evaluation (`GreatSellerPolicy`), and Trust & Safety restriction fields.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/auth-jwt-and-security-architecture.md`](/docs/auth-jwt-and-security-architecture.md) · [`docs/multi-tier-redis-caching-and-invalidation.md`](/docs/multi-tier-redis-caching-and-invalidation.md)
> - **Proposal:** [`docs/proposals/chat-moderation-user-blocking-and-messaging-settings.md`](/docs/proposals/chat-moderation-user-blocking-and-messaging-settings.md)
> - **Frontend Module:** [`secondhand-frontend/src/user/README.md`](/secondhand-frontend/src/user/README.md)
> - **Key Entry Points:** [`UserController`](api/UserController.java) · [`AddressController`](api/AddressController.java) · [`MembershipController`](api/MembershipController.java) · [`UserBadgesController`](api/UserBadgesController.java) · [`UserService`](application/UserService.java) · [`IUserService`](application/IUserService.java) · [`MembershipService`](application/MembershipService.java) · [`GreatSellerPolicy`](domain/greatseller/GreatSellerPolicy.java) · [`UserRestrictionService`](application/UserRestrictionService.java)

## Business Rules & Invariants
- **Private vs. Sanitized Public Profile:** `/api/v1/users/me` returns the full `UserDto` to the authenticated owner. Public endpoints (`/api/v1/users/{id}`) return `PublicUserProfileDto`, stripping email, phone, birthdate, roles, and sanction details, and exposing only `ListingStatus.ACTIVE` listings.
- **Single Main Address (`AddressService`):** At most one address per user has `isMain = true`; designating a new main address atomically demotes the previous main address (`demoteExistingMainAddress`) in the same transaction.
- **Memberships & Schedulers (`MembershipService`, `MembershipScheduler`):** Manages `BASIC`, `PLUS`, and `PRO` tiers and daily Aura AI usage counters (reset daily at midnight; expired plans with `autoRenew == true` charge the user's eWallet or downgrade to `BASIC`).
- **Event-Driven Great Seller Badge (`GreatSellerPolicy`):** `GreatSellerEligibilityEventListener` consumes `SellerEligibilityRecheckEvent` asynchronously to evaluate completed order volume, fulfillment speed, dispute rate, and rating (`>= 4.5`).
- **Trust & Safety State:** Stores `warning_count` (decays to `0` after 180 infraction-free days), `banned_until`, `is_chat_restricted`, and `is_listing_restricted` (see [`complaint/README.md`](../complaint/README.md)).
- **Moderation restrictions (`UserRestrictionService`):** a ban is active while `acc_status = BLOCKED` or `banned_until` is in the future; leftover flags after expiry do nothing. `RestrictedAction` guards chat send, listing create/publish/reactivate, offers and checkout (`RestrictionErrorCodes`, 403). State is cached under `KEY_PREFIX` (restricted until the ban ends, unrestricted for `UNRESTRICTED_TTL`); a miss or Redis outage reads PostgreSQL. Withdrawals, order tracking, delivery and refunds are never restricted.
- **Change rule:** anything that changes ban fields must call `UserRestrictionService.invalidate` after commit; a new ban publishes `UserBannedEvent`.

- **User blocking (`UserBlockService`, `user_blocks`):** hides both users from each other and closes chat, offers, cart and new checkout (`USER_BLOCKED`); running orders are untouched. Profile reads return `USER_BLOCKED_YOU` or `USER_BLOCKED_BY_YOU` (403).
- **`users.can_send_message`:** default `TRUE`; seeds the create-form default of `listings.can_send_message`.

## API
- **Profile (`UserController`, `/api/v1/users`):** `GET /me` · `GET /{id}` · `GET /{id}/listings` · `PUT /email` · `PUT /phone` · `GET /great-sellers` · `GET /{id}/great-seller-status` · `GET /me/restriction` (`RestrictionStatusDto`) · `GET|PATCH /me/settings` (`canSendMessage`) · `GET /me/blocked-users` · `POST|DELETE /{id}/block` · `GET /{id}/block-status`.
- **Addresses (`AddressController`, `/api/v1/users/addresses`):** `GET /` · `POST /` · `PUT /{id}` · `DELETE /{id}` · `POST /{id}/main`.
- **Memberships (`MembershipController`, `/api/v1/memberships`):** `GET /status` · `GET /quote` (`MembershipQuoteDto`: premium price and eWallet balance check) · `POST /upgrade` (`MembershipUpgradeRequest`) · `POST /cancel` · `POST /toggle-auto-renew`.
- **Badges (`UserBadgesController`, `/api/v1/user/badges`):** `GET /`.
