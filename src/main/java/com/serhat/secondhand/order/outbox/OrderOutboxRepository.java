package com.serhat.secondhand.order.outbox;

import com.serhat.secondhand.payment.outbox.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;

public interface OrderOutboxRepository extends JpaRepository<OrderOutboxEvent, UUID> {

    @Query("SELECT e FROM OrderOutboxEvent e " +
           "WHERE e.status IN :statuses AND e.nextAttemptAt <= :now " +
           "ORDER BY e.createdAt ASC")
    List<OrderOutboxEvent> findPendingEvents(
            @Param("statuses") Collection<OutboxStatus> statuses,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Modifying
    @Query("DELETE FROM OrderOutboxEvent e WHERE e.status = :status AND e.processedAt < :cutoff")
    int deleteByStatusAndProcessedAtBefore(@Param("status") OutboxStatus status, @Param("cutoff") LocalDateTime cutoff);
}
