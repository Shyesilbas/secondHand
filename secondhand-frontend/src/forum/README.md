# Forum UI Module

Community discussion boards, peer-to-peer advice threads, and comment streams.

## Architecture

- **`ForumPage`:** Main discussion hub (`/forum`) supporting thread categorization, search, sort modes, and thread creation.
- **`ThreadComposerModal`:** Dialog allowing authenticated members to compose new discussion threads with title, category, and body.
- **`ThreadDetail` & `CommentItem`:** Full thread viewer rendering author profile, post timestamp, interactive likes, and comment threads.
- **`ForumVisibilitySettingsModal`:** User preference modal for controlling profile visibility within forum interactions.
- **Hooks & Services:**
  - `useForumThreads`: Infinite or paginated thread list query hook.
  - `useForumThread`: Detailed thread reader hook managing individual thread queries and real-time comment additions.
  - `forumService`: API service communicating with `/v1/forum/*` endpoints.

## Invariants

- **Guest Protection:** Unauthenticated visitors can read public discussions but must log in to compose threads, comment, or like.
- **Cache Eviction:** Posting a new thread invalidates `['forum', 'threads']`; posting a comment updates `['forum', 'thread', threadId]`.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: clean typographic layout, subtle comment dividers, and zero decorative emojis.

