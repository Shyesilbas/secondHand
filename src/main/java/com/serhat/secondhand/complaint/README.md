# Complaint & Trust & Safety Domain

## Purpose
The `complaint` domain handles user reporting, listing abuse flagging, dispute intake, and autonomous **Aura AI (Gemini)** moderation across the platform. It eliminates the need for human administrators while maintaining strict guarantees around fairness, cooling-off buffers, rate limits, and financial rights protection.

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/aura-trust-safety-and-complaint-moderation-architecture.md`](../../../../../../../docs/aura-trust-safety-and-complaint-moderation-architecture.md)
> - **Frontend Module:** [`secondhand-frontend/src/complaint/README.md`](../../../../../../../secondhand-frontend/src/complaint/README.md)

## Architecture & Lifecycle Overview
1. **Intake & Cooling-Off Period:**
   - Complaints are submitted via `POST /api/v1/complaints` and assigned `status = 'PENDING'` and `eligible_for_review_at = NOW() + 2 hours`.
   - The complaint ID is enqueued into Redis Sorted Set `v4:complaints:delayed_queue` with score = epoch timestamp.
   - Throttling: Each user is limited to 5 complaints per 24 hours via `v4:rate_limit:complaint:user:{userId}`.
2. **Batch Processing Worker:**
   - An hourly `@Scheduled` worker with a distributed Redis lock (`v4:lock:complaint:worker`) pulls up to 10 matured complaints (`ZRANGEBYSCORE ... LIMIT 0 10`) without polling PostgreSQL.
3. **Aura AI Context Aggregation & Structured Evaluation:**
   - Context gathering pulls chat transcripts (centered on `reported_message_id`), listing snapshots, and optional Cloudinary evidence photos (`evidence_image_urls`).
   - Gemini evaluates the complaint using strict JSON Schema output within an `<untrusted_evidence>` sandbox to defeat prompt injection attempts.
   - Presumption of innocence: If `confidenceScore < 0.66`, severe sanctions are prohibited (`DISMISSED` or courtesy `WARNING` only).
4. **Graduated Sanction Ladder:**
   - `WARNING`: Official warning notice; increments `warning_count` (3 warnings escalate to 7-day ban).
   - `LISTING_SUSPENDED`: Listing status set to `INACTIVE`.
   - `TEMP_BAN_7_DAYS`: Account suspended for 7 days (`banned_until = NOW() + 7 DAYS`); active listings deactivated with zero refund for `listing_fee` and `showcase_fee`.
   - `PERM_BAN`: Permanent account termination (`AccountStatus.BLOCKED`); all listings removed without refund.
5. **Appeals & Good Conduct Decay:**
   - Users may file a single appeal per sanction within 7 days (`appeal_status = 'PENDING'`), re-evaluated by Aura AI in a second-look mode.
   - 180-Day Strike Decay: Users with no new infractions for 180 consecutive days have their `warning_count` reset to 0 via lazy evaluation.
6. **Financial & Escrow Invariants:**
   - Banned users maintain ownership of legitimate pre-ban commercial rights: in-flight orders deliver normally, seller escrow releases to eWallet upon delivery, and fund withdrawals (`withdraw`) remain permitted. Unfulfilled seller orders are cancelled and refunded to buyers.

## Integration Points
- **Incoming:** REST calls via `ComplaintController`.
- **Outgoing:** 
  - `EmailKafkaProducer`: Publishes moderation email events to `mail.dispatch.v1`.
  - `RedisTemplate`: Manages delayed queues, distributed locks, rate limits, and hot-path restriction caches (`v4:user:restriction:{userId}`).
  - `user`: Queries user profiles, warning counts, and restriction statuses.

## Public APIs
- `POST /api/v1/complaints`: Submits a new user, listing, or chat complaint (max 5/day).
- `GET /api/v1/users/me/complaints`: Retrieves complaints filed by the current user.
- `GET /api/v1/users/me/complaints/received`: Retrieves complaints and moderation decisions filed against the current user.
- `POST /api/v1/complaints/{id}/appeal`: Submits a one-time appeal against an Aura moderation sanction.
