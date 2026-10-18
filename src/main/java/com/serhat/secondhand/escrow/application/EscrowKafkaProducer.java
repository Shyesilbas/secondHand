package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowKafkaProducer {

    public static final String ESCROW_RELEASED_TOPIC = "escrow.released.v1";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CompletableFuture<Void> sendEscrowReleased(EscrowReleasedKafkaEvent event) {
        String key = event.sellerId() != null ? String.valueOf(event.sellerId()) : event.escrowId().toString();

        log.info("Publishing EscrowReleasedKafkaEvent to Kafka topic: {} with key: {}", ESCROW_RELEASED_TOPIC, key);
        return kafkaTemplate.send(ESCROW_RELEASED_TOPIC, key, event)
                .thenAccept(result -> log.info("Successfully sent EscrowReleasedKafkaEvent for escrowId: {} offset: {}",
                        event.escrowId(), result.getRecordMetadata().offset()));
    }
}
