package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.order.outbox.OrderOutboxRepository;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/** Operator actions on the outbox tables. Requeue is only allowed for events that exhausted their attempts. */
@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxAdminService {

    private final PaymentOutboxRepository paymentOutboxRepository;
    private final OrderOutboxRepository orderOutboxRepository;
    private final EscrowOutboxRepository escrowOutboxRepository;

    /**
     * Resets one {@code FAILED} event to {@code PENDING} with a fresh attempt counter so the worker retries it.
     * The update is a single conditional statement, so a concurrent worker pass cannot be raced.
     */
    @Transactional
    public Result<Void> requeueFailed(OutboxType type, UUID eventId) {
        LocalDateTime now = LocalDateTime.now();
        int updated = switch (type) {
            case PAYMENT -> paymentOutboxRepository.requeueByIdAndStatus(eventId, OutboxStatus.FAILED, OutboxStatus.PENDING, now);
            case ORDER -> orderOutboxRepository.requeueByIdAndStatus(eventId, OutboxStatus.FAILED, OutboxStatus.PENDING, now);
            case ESCROW -> escrowOutboxRepository.requeueByIdAndStatus(eventId, OutboxStatus.FAILED, OutboxStatus.PENDING, now);
        };
        if (updated == 0) {
            return Result.error(OutboxErrorCodes.OUTBOX_EVENT_NOT_REQUEUEABLE);
        }
        log.warn("Outbox event requeued by operator: type={}, eventId={}", type, eventId);
        return Result.success();
    }
}
