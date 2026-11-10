# Follow UI Module

Seller following system, follower/following lists, and follower metric badges.

## Architecture

- **`FollowButton`:** Toggle button placed on seller profile headers and listing detail cards. Triggers optimistic follow/unfollow mutations and prompts guests to sign in.
- **`FollowStats`:** Summary component rendering counts for followers and following users with clickable triggers to launch `FollowListModal`.
- **`FollowListModal`:** Modal listing users who follow or are followed by a target seller, with inline follow back buttons.
- **`useFollow`:** React Query hook handling follow status queries (`isFollowing`) and toggle mutations.
- **`followService`:** API service managing `/v1/follows/*` endpoints.

## Invariants

- **Self-Follow Prevention:** Users cannot follow their own account; `FollowButton` is suppressed when `targetUserId === currentUserId`.
- **Cache Invalidation:** Toggling a follow invalidates `['follow', 'status', targetUserId]`, `['follow', 'followers', targetUserId]`, and `['follow', 'following', currentUserId]`.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean toggle buttons, subtle borders, and zero celebratory emojis.

