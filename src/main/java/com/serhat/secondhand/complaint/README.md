# Complaint Domain

User-to-user complaints (`complaints` table), optionally about a listing or a chat message, reviewed by Aura (Gemini) after a cooling-off delay, closed with a sanction ladder step and open to one appeal.

> [!NOTE]
> **Related Documentation:**
> - **Design:** [`docs/proposals/aura-trust-safety-and-complaint-moderation.md`](/docs/proposals/aura-trust-safety-and-complaint-moderation.md)
> - **Frontend Module:** [`secondhand-frontend/src/complaint/README.md`](/secondhand-frontend/src/complaint/README.md)
> - **Key Entry Points:** [`ComplaintService`](application/ComplaintService.java) · [`ComplaintValidator`](validator/ComplaintValidator.java) · [`ComplaintReviewWorker`](queue/ComplaintReviewWorker.java) · [`AuraComplaintReviewHandler`](review/AuraComplaintReviewHandler.java) · [`AuraAppealReviewHandler`](review/AuraAppealReviewHandler.java) · [`SanctionPolicy`](review/SanctionPolicy.java) · [`SanctionExecutor`](review/SanctionExecutor.java)

## Business Rules & Invariants
- **Intake:** no self-complaints; one open (`ComplaintValidator.ACTIVE_STATUSES`) complaint per pair; a listing must belong to the reported user; a `reportedMessageId` needs a shared `chatRoomId` and must come from the reported user; evidence images limited by `app.moderation.max-evidence-images` and `evidence-image-host`.
- **Daily quota:** `daily-complaint-limit` per `daily-limit-window`, taken after validation; Redis down fails closed (`COMPLAINT_RATE_LIMIT_UNAVAILABLE`).
- **Review flow:** claim `PENDING -> INVESTIGATING`, build context (ids only, transcript, brigade signals, user text escaped inside `<untrusted_evidence>`), download images (`EvidenceImageLoader`, evidence host only, no redirects), call Gemini outside any transaction, parse strictly, apply in a second transaction. Any failure releases the claim; the worker retries.
- **Sanction ladder (`SanctionPolicy`):** escalation first, then the `min-confidence` cap (never above `WARNING`). Warnings decay after `strike-decay`.
- **Bad faith:** only a dismissed complaint with `badFaithReport` and `bad-faith-min-confidence` bans the complainer: first time `TEMP_BAN_7_DAYS`, repeat or `coordinatedAttackSuspected` `PERM_BAN`. Brigade signals cover `brigade-window`: other complainers, new accounts, shared last-login IP, sample texts (counts only, never ids or IPs).
- **Effects (`SanctionExecutor`):** `WARNING` counts a strike; `LISTING_SUSPENDED` deactivates that listing; bans set restrictions, take down active listings, invalidate the restriction cache and publish `UserBannedEvent` (the order module cancels unshipped orders); perm ban also blocks the account and revokes sessions. Fees are not refunded.
- **Appeals:** the reported user, once, within `appeal-window`, for `PenaltyAction.isAppealable()` steps. Only a confident approval reverses (`SanctionExecutor.reverse`): one warning back, or the temp ban lifted unless a later ban runs longer; listings stay inactive. Approved appeals stop counting toward escalation.
- **Change rule:** listing descriptions are not edited with a suspension note; bad-faith complainers cannot appeal.
- **Notifications:** emails (`ComplaintEmailListener`) and bell notifications (`ComplaintNotificationListener`) after commit.

## Redis Queue & Worker
- `ComplaintReviewQueue` (`QUEUE_KEY`, `APPEAL_QUEUE_KEY`), filled after commit by `ComplaintQueueListener`; `ComplaintQueueRecovery` releases stale claims and re-queues `PENDING` complaints and appeals on startup (ZADD NX).
- `ComplaintReviewWorker` (`app.moderation.worker.*`, off by default) runs on `moderationExecutor` under `ComplaintWorkerLock`: up to `batch-size` complaints, then appeals; failures move back by `retry-delay`.

## API
- `POST /api/v1/complaints` (`ComplaintController`) — submit (`ComplaintRequest`).
- `POST /api/v1/complaints/{complaintId}/appeal` — appeal (`AppealRequest`).
- `GET /api/v1/users/me/complaints` and `/received` (`UserController`) — filed by / against the current user (`ComplaintDto`).
