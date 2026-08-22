package com.serhat.secondhand.core.idempotency;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "processed_kafka_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedKafkaEvent {

    @Id
    private String id;

    @Column(name = "consumer_group", nullable = false)
    private String consumerGroup;

    @Column(name = "processed_at")
    @Builder.Default
    private LocalDateTime processedAt = LocalDateTime.now();
}
