# Forum Domain

## Purpose
The `forum` domain manages community discussions, suggestions, complaint topics, and user engagement reactions for the marketplace platform.

## Architecture Overview
- **Thread & Comment Hierarchy:** `ForumThread` holds root topics categorized by domain (`ForumCategory`), supporting nested replies via `ForumComment`.
- **Author Privacy (`ForumAuthorVisibility`):** Allows users to post either anonymously (`ANONYMOUS`), with display name (`DISPLAY_NAME`), or full name (`FULL_NAME`).
- **Reaction System (`ForumReactionType`):** `ForumThreadReaction` and `ForumCommentReaction` support atomic `LIKE` and `DISLIKE` reactions with single-reaction-per-user constraints.
- **Service Orchestration:** `ForumService` manages thread publication, status changes, comment moderation, reactions, and sorting.

## Business Invariants & Constraints
- **Thread Status Controls (`ForumThreadStatus`):**
  - `OPEN`: Standard active thread open to replies.
  - `IN_PROGRESS`: Marked in progress by moderation/team.
  - `RESOLVED`: Resolved issue or closed suggestion.
- **Categories (`ForumCategory`):** `SUGGESTIONS`, `COMPLAINTS`.
- **Sorting Options (`ForumThreadSort`):** `NEW` (by creation date descending), `TOP` (by total likes and date descending).
- **Single Active Reaction:** A user can have at most one active reaction per thread or comment. Submitting the same reaction toggles/removes it; submitting a different reaction updates the reaction atomically.
- **Validation:** `ForumValidator` enforces minimum character limits, category validity, and profanity/spam restrictions.

## Public APIs
- `GET /api/v1/forums/threads`: Paginated thread listing with sorting (`NEW`, `TOP`), keyword search `q`, status, and category filtering.
- `GET /api/v1/forums/threads/{thread-id}`: Detailed thread view including author details (respecting visibility settings).
- `POST /api/v1/forums/threads`: Creates a new discussion thread.
- `PATCH /api/v1/forums/threads/{thread-id}`: Modifies title or content of a thread.
- `PATCH /api/v1/forums/threads/{thread-id}/status`: Updates thread lifecycle status.
- `DELETE /api/v1/forums/threads/{thread-id}`: Deletes a thread.
- `POST /api/v1/forums/threads/{thread-id}/reaction`: Adds or toggles a `LIKE` / `DISLIKE` on a thread.
- `GET /api/v1/forums/threads/{thread-id}/comments`: Lists comments on a thread.
- `POST /api/v1/forums/threads/{thread-id}/comments`: Adds a comment to a thread.
- `POST /api/v1/forums/threads/{thread-id}/comments/{comment-id}/reaction`: Adds or toggles a reaction on a comment.
