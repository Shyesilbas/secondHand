package com.serhat.secondhand.payment.outbox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PaymentOutboxRepository extends JpaRepository<PaymentOutboxEvent, UUID> {
    List<PaymentOutboxEvent> findByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(
            List<OutboxStatus> statuses,
            LocalDateTime now,
            Pageable pageable
    );

    // SKIP LOCKED (-2): another instance already claimed this row
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.QueryHints(@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @org.springframework.data.jpa.repository.Query("SELECT e FROM PaymentOutboxEvent e WHERE e.id = :id")
    java.util.Optional<PaymentOutboxEvent> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

    @Modifying
    @Query("DELETE FROM PaymentOutboxEvent e WHERE e.status = :status AND e.processedAt < :cutoff")
    int deleteByStatusAndProcessedAtBefore(@Param("status") OutboxStatus status, @Param("cutoff") LocalDateTime cutoff);
}
