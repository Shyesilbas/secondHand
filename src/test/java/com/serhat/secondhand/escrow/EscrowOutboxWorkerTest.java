package com.serhat.secondhand.escrow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.escrow.application.EscrowKafkaProducer;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxEvent;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxWorker;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EscrowOutboxWorkerTest {

    private final EscrowOutboxRepository repo = mock(EscrowOutboxRepository.class);
    private final EscrowKafkaProducer producer = mock(EscrowKafkaProducer.class);
    private final EscrowOutboxWorker worker = new EscrowOutboxWorker(repo, producer, new ObjectMapper().findAndRegisterModules());

    private EscrowOutboxEvent pending() {
        UUID id = UUID.randomUUID();
        EscrowOutboxEvent e = EscrowOutboxEvent.builder().id(id).status(OutboxStatus.PENDING)
                .payload("{\"escrowId\":1}").build();
        when(repo.findById(id)).thenReturn(Optional.of(e));
        return e;
    }

    @Test
    void kafkaFailureKeepsEventRetryableAndCountsAttempt() {
        EscrowOutboxEvent e = pending();
        when(producer.sendEscrowReleased(any())).thenReturn(CompletableFuture.failedFuture(new RuntimeException("broker down")));

        worker.processEvent(e.getId());

        assertEquals(OutboxStatus.FAILED, e.getStatus());
        assertEquals(1, e.getAttemptCount());
    }

    @Test
    void kafkaAckMarksProcessed() {
        EscrowOutboxEvent e = pending();
        when(producer.sendEscrowReleased(any())).thenReturn(CompletableFuture.completedFuture(null));

        worker.processEvent(e.getId());

        assertEquals(OutboxStatus.PROCESSED, e.getStatus());
    }
}
