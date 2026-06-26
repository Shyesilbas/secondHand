# User Domain

## Purpose
The `user` domain manages user profiles, delivery/billing addresses, user badges, and automated eligibility systems like "Great Seller".

## Architecture Overview
- **UserService:** Profile management, incorporating caching strategies.
- **AddressService:** Address management and main-address resolution.
- **UserBadgeService & GreatSellerService:** Evaluate user metrics (ratings, order volume) to assign prestige badges.

## Business Invariants & Constraints
- **Unique Identifiers:** Email and phone numbers must be strictly unique across the system.
- **Main Address:** Only one address per user can be marked as the main address at any given time.
- **Badge Eligibility:** Great Seller status is resolved via `GreatSellerPolicy` using historical aggregate data, triggered asynchronously.

## State Machines
- **Address Status:** Standard -> Main (demotes previously main address).

## Integration Points
- **Incoming:** Triggered by user profile updates or periodic schedulers for badge synchronization.
- **Outgoing:** Queries historical order and review data for badge eligibility.

## Public APIs
- Standard Profile CRUD and Address Management.

## Related Knowledge
- *(Modifications to profile rules are contained within the entity and validation services)*
