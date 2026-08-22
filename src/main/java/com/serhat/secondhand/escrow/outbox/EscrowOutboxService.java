package com.serhat.secondhand.escrow.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowOutboxService {

    public static final String EVENT_ESCROW_RELEASED = "ESCROW_RELEASED";

    private final EscrowOutboxRepository escrowOutboxRepository;
    private final ObjectMapper objectMapper;

    public void enqueueEscrowReleased(Escrow escrow) {
        try {
            EscrowReleasedKafkaEvent event = new EscrowReleasedKafkaEvent(
                    escrow.getId(),
                    escrow.getOrder() != null ? escrow.getOrder().getId() : null,
                    escrow.getOrder() != null ? escrow.getOrder().getOrderNumber() : null,
                    escrow.getOrderItem() != null ? escrow.getOrderItem().getId() : null,
                    escrow.getListingId(),
                    escrow.getSeller() != null ? escrow.getSeller().getId() : null,
                    escrow.getSeller() != null ? escrow.getSeller().getEmail() : null,
                    escrow.getBuyer() != null ? escrow.getBuyer().getId() : null,
                    escrow.getBuyer() != null ? escrow.getBuyer().getEmail() : null,
                    escrow.getAmount(),
                    "TRY",
                    LocalDateTime.now()
            );

            String payload = objectMapper.writeValueAsString(event);

            EscrowOutboxEvent outboxEvent = EscrowOutboxEvent.builder()
                    .eventType(EVENT_ESCROW_RELEASED)
                    .aggregateType("Escrow")
                    .aggregateId(escrow.getId().toString())
                    .payload(payload)
                    .status(OutboxStatus.PENDING)
                    .build();

            escrowOutboxRepository.save(outboxEvent);
            log.info("Enqueued ESCROW_RELEASED outbox event for escrow ID: {}", escrow.getId());
        } catch (Exception e) {
            log.error("Failed to enqueue escrow release outbox event for escrow ID: {}", escrow.getId(), e);
            throw new RuntimeException("Escrow outbox enqueue failed", e);
        }
    }
}
