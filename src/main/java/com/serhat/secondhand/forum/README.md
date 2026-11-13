# Forum Domain

Powers community discussion threads (`forum_threads` in categories `SUGGESTIONS` and `COMPLAINTS`), replies (`forum_comments`), author privacy modes (`ForumAuthorVisibility`), keyword tag extraction (`KeywordEngine`), and atomic `LIKE`/`DISLIKE` reaction toggling.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Frontend Module:** [`secondhand-frontend/src/forum/README.md`](/secondhand-frontend/src/forum/README.md)
> - **Key Entry Points:** [`ForumController`](api/ForumController.java) · [`ForumService`](application/ForumService.java) · [`ForumValidator`](validator/ForumValidator.java) · [`KeywordEngine`](application/KeywordEngine.java) · [`ForumThreadMapper`](mapper/ForumThreadMapper.java) · [`ForumCommentMapper`](mapper/ForumCommentMapper.java)

## Business Rules & Invariants
- **Thread Lifecycle & Ownership (`ForumThreadStatus`, `ForumErrorCodes`):** Threads progress across `OPEN`, `IN_PROGRESS`, and `RESOLVED`. Only the author or an admin may edit or delete a thread (`UNAUTHORIZED_ACCESS`). `KeywordEngine` extracts normalized search tags from thread content on creation.
- **Author Privacy (`ForumAuthorVisibility`):** Authors select `ANONYMOUS` (masks identity and avatar in DTO responses), `DISPLAY_NAME`, or `FULL_NAME` per thread or comment.
- **Single-Reaction Toggle & Swap State Machine:** Enforced by `UNIQUE (thread_id, user_id)` on `forum_thread_reactions` and `UNIQUE (comment_id, user_id)` on `forum_comment_reactions`:
  - Sending the same `ForumReactionType` (`LIKE` or `DISLIKE`) deletes the reaction and decrements its counter.
  - Sending the opposite reaction swaps `reaction_type`, decrements the old counter, and increments the new counter in one transaction.

## API (`ForumController`, `/api/v1/forums/threads`)
- `GET /` & `GET /{thread-id}` — paginated thread search (filter by `category`, `status`, `q`, `sort`) and thread detail (`ForumThreadDto`).
- `POST /` · `PATCH /{thread-id}` · `PATCH /{thread-id}/status` · `DELETE /{thread-id}` — create, edit, change status, or delete a thread.
- `POST /{thread-id}/reaction` — add, swap, or toggle off a thread reaction.
- `GET /{thread-id}/comments` & `POST /{thread-id}/comments` — list or add thread comments (`ForumCommentDto`).
- `POST /{thread-id}/comments/{comment-id}/reaction` — add, swap, or toggle off a comment reaction.
