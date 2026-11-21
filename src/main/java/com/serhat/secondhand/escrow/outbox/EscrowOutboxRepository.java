package com.serhat.secondhand.escrow.outbox;

import com.serhat.secondhand.payment.outbox.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface EscrowOutboxRepository extends JpaRepository<EscrowOutboxEvent, UUID> {

    List<EscrowOutboxEvent> findByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(
            Collection<OutboxStatus> statuses,
            LocalDateTime now,
            Pageable pageable
    );

    // SKIP LOCKED (-2): another instance already claimed this row
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.QueryHints(@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @org.springframework.data.jpa.repository.Query("SELECT e FROM EscrowOutboxEvent e WHERE e.id = :id")
    java.util.Optional<EscrowOutboxEvent> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM EscrowOutboxEvent e WHERE e.status = :status AND e.processedAt < :cutoff")
    int deleteByStatusAndProcessedAtBefore(@org.springframework.data.repository.query.Param("status") OutboxStatus status, @org.springframework.data.repository.query.Param("cutoff") LocalDateTime cutoff);

    long countByStatus(OutboxStatus status);

    /** Atomically moves one event from {@code from} back to {@code to} for a fresh retry cycle; returns the updated row count (0 or 1). */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query("UPDATE EscrowOutboxEvent e SET e.status = :to, e.attemptCount = 0, e.nextAttemptAt = :now, e.lastError = null WHERE e.id = :id AND e.status = :from")
    int requeueByIdAndStatus(@org.springframework.data.repository.query.Param("id") UUID id,
                             @org.springframework.data.repository.query.Param("from") OutboxStatus from,
                             @org.springframework.data.repository.query.Param("to") OutboxStatus to,
                             @org.springframework.data.repository.query.Param("now") LocalDateTime now);
}
