package com.serhat.secondhand.core.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedKafkaEventRepository extends JpaRepository<ProcessedKafkaEvent, String> {

    @Modifying
    @Query(value = "INSERT INTO processed_kafka_events (id, consumer_group, processed_at) VALUES (:id, :consumerGroup, NOW()) ON CONFLICT (id) DO NOTHING", nativeQuery = true)
    int insertIfNotExists(@Param("id") String id, @Param("consumerGroup") String consumerGroup);

    @Modifying
    @Query("DELETE FROM ProcessedKafkaEvent e WHERE e.processedAt < :cutoff")
    int deleteByProcessedAtBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}
