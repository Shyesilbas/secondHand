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
}
