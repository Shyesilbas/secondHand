package com.serhat.secondhand.order.outbox;

import com.serhat.secondhand.payment.outbox.OutboxStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_outbox_events", indexes = {
        @Index(name = "idx_order_outbox_status_next_attempt", columnList = "status, next_attempt_at"),
        @Index(name = "idx_order_outbox_aggregate", columnList = "aggregate_type, aggregate_id")
})
public class OrderOutboxEvent {

    @Id
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "aggregate_type", nullable = false, length = 100)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false, length = 100)
    private String aggregateId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OutboxStatus status;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 10;

    @Column(name = "next_attempt_at", nullable = false)
    private LocalDateTime nextAttemptAt;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (nextAttemptAt == null) nextAttemptAt = LocalDateTime.now();
        if (status == null) status = OutboxStatus.PENDING;
        if (attemptCount == null) attemptCount = 0;
        if (maxAttempts == null) maxAttempts = 10;
    }
}
