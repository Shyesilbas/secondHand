# Showcase & Boost UI Module

Listing promotion, showcase placement selection, and active showcase boost management.

## Architecture

- **`ShowcaseModal`:** Dialog allowing sellers to select showcase tiers (Homepage, Category Top, Urgent Badge), view duration options, calculate required fees, and purchase boosts using their eWallet balance.
- **`MyShowcasesPanel`:** Management panel displaying the seller's active listing boosts, remaining duration, and expiry dates.
- **`ShowcaseButton`:** Contextual action button rendered on seller listing items to open showcase boost configuration.
- **`ShowcaseSuccessModal`:** Confirmation dialog shown upon successful showcase activation.
- **Key Hooks:**
  - `useShowcase`: Coordinates showcase type metadata fetching, price calculation, and the showcase purchase mutation.
  - `useMyShowcases`: React Query hook caching the authenticated user's active showcase records (`/v1/showcases/my`).

## Invariants

- **Atomic Cache Eviction:** Purchasing a showcase immediately invalidates `['showcases', 'my']`, `['listings', 'my']`, `['listings']`, and `['ewallet', 'balance']`.
- **Payment Constraint:** Showcase purchases debit directly from the seller's eWallet. If the wallet balance is insufficient, the user is prompted to top up before completing the purchase.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: subtle badge styling for boosted listings, no flashy blinking animations, and zero emojis.

