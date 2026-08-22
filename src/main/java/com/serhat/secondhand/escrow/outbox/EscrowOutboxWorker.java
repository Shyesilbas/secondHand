package com.serhat.secondhand.escrow.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.escrow.application.EscrowKafkaProducer;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EscrowOutboxWorker {

    private final EscrowOutboxRepository escrowOutboxRepository;
    private final EscrowKafkaProducer escrowKafkaProducer;
    private final ObjectMapper objectMapper;

    @Lazy
    @Autowired
    private EscrowOutboxWorker self;

    @Scheduled(
            fixedDelayString = "${app.escrow.outbox.fixed-delay-ms:5000}",
            initialDelayString = "${app.escrow.outbox.initial-delay-ms:5000}"
    )
    @Transactional
    public void processPendingEvents() {
        List<EscrowOutboxEvent> events = escrowOutboxRepository
                .findByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(
                        List.of(OutboxStatus.PENDING, OutboxStatus.FAILED),
                        LocalDateTime.now(),
                        PageRequest.of(0, 50)
                );

        for (EscrowOutboxEvent event : events) {
            self.processEvent(event.getId());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processEvent(UUID eventId) {
        EscrowOutboxEvent event = escrowOutboxRepository.findById(eventId).orElse(null);
        if (event == null || event.getStatus() == OutboxStatus.PROCESSED) {
            return;
        }

        try {
            event.setStatus(OutboxStatus.PROCESSING);
            escrowOutboxRepository.save(event);

            EscrowReleasedKafkaEvent releasedEvent = objectMapper.readValue(event.getPayload(), EscrowReleasedKafkaEvent.class);
            escrowKafkaProducer.sendEscrowReleased(releasedEvent);

            event.setStatus(OutboxStatus.PROCESSED);
            event.setProcessedAt(LocalDateTime.now());
            event.setLastError(null);
            escrowOutboxRepository.save(event);
            log.info("Successfully processed and published escrow outbox event ID: {}", eventId);
        } catch (Exception ex) {
            log.error("Failed to process escrow outbox event ID: {}", eventId, ex);
            int attempts = event.getAttemptCount() + 1;
            event.setAttemptCount(attempts);
            event.setLastError(ex.getMessage());

            if (attempts >= event.getMaxAttempts()) {
                event.setStatus(OutboxStatus.FAILED);
                log.error("Escrow outbox event ID: {} max attempts reached ({})", eventId, attempts);
            } else {
                event.setStatus(OutboxStatus.FAILED);
                long delaySeconds = (long) Math.min(300, Math.pow(2, attempts) * 5);
                event.setNextAttemptAt(LocalDateTime.now().plusSeconds(delaySeconds));
            }
            escrowOutboxRepository.save(event);
        }
    }
}
