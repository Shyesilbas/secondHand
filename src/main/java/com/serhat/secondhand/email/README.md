# Email Domain

Renders localized Thymeleaf emails (`EmailTemplateService`) and delivers them to the recipient's in-app mailbox (`emails` table) via an asynchronous Kafka pipeline (`EmailKafkaProducer` -> `mail.dispatch.v1` -> `EmailKafkaConsumer`) with consumer deduplication and 30-day retention cleanup (`EmailPurgeScheduler`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/email-architecture-and-event-driven-dispatch.md`](/docs/email-architecture-and-event-driven-dispatch.md) (Kafka pipeline, Thymeleaf i18n rendering, in-app inbox design)
> - **Frontend Module:** [`secondhand-frontend/src/emails/README.md`](/secondhand-frontend/src/emails/README.md) · [`secondhand-frontend/src/inbox/README.md`](/secondhand-frontend/src/inbox/README.md)
> - **Key Entry Points:** [`EmailController`](api/EmailController.java) · [`EmailService`](application/EmailService.java) · [`EmailTemplateService`](application/EmailTemplateService.java) · [`EmailKafkaProducer`](application/kafka/EmailKafkaProducer.java) · [`EmailKafkaConsumer`](application/kafka/EmailKafkaConsumer.java) · [`EmailPurgeScheduler`](application/scheduler/EmailPurgeScheduler.java)

## Business Rules & Invariants
- **In-App Mailbox Delivery:** Outbound emails persist into the `emails` table (`EmailStatus.SENT`, read via `/api/v1/emails/my-emails`) with no external SMTP dependency in dev/staging.
- **Direct Kafka Publish & Idempotent Consumer:** Domain modules publish `EmailEvent`s via `EmailEventPublisher` -> `EmailKafkaProducer` to `mail.dispatch.v1` (`MailDispatchKafkaEvent`, non-outbox exception documented in `transactional-outbox-and-redis-concurrency`). `EmailKafkaConsumer` deduplicates via `ProcessedKafkaEventRepository.insertIfNotExists("mail:dispatch:" + eventId, "mail-dispatch-consumers")`, renders Thymeleaf HTML (`resources/templates/emails/`, `messages*.properties`), and persists via `EmailSender` (`Propagation.REQUIRES_NEW`).
- **Ownership, Soft Delete & 30-Day Retention:** Inbox queries and mutations filter strictly by `currentUser.getId()` and `currentUser.getEmail()`. `DELETE` endpoints soft-delete rows (`deleted_at = now()`), and `EmailPurgeScheduler` runs daily at 02:00 to hard-delete rows older than 30 days (`deleteOldEmails`).

## Redis, Caching & Kafka
- Kafka topic: `mail.dispatch.v1` (`MailDispatchKafkaEvent`), consumer group `mail-dispatch-consumers`.
- Read and delete mutations evict Spring cache `user:badges` (`@CacheEvict(value = "user:badges", key = "#userId")`).

## API (`EmailController`, `/api/v1/emails`)
- `GET /my-emails` & `GET /my-emails/{email-type}` — paginated recipient inbox (optionally filtered by `EmailType`).
- `GET /unread-count` — count of unread emails (`readAt IS NULL`).
- `PATCH /{id}/read` & `PATCH /read-all` — mark one or all inbox emails as read.
- `DELETE /{email-id}` & `DELETE /` — soft-delete one or all inbox emails.
