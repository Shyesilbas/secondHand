package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderKafkaProducer {

    public static final String ORDER_CANCELLED_TOPIC = "order.cancelled.v1";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CompletableFuture<Void> publishOrderCancelled(OrderCancelledKafkaEvent event) {
        String key = event.orderId() != null ? event.orderId().toString() : "unknown-order";

        return kafkaTemplate.send(ORDER_CANCELLED_TOPIC, key, event)
                .thenAccept(result -> log.info("OrderCancelledKafkaEvent published successfully to topic: {} for orderId: {}",
                        ORDER_CANCELLED_TOPIC, event.orderId()))
                .exceptionally(ex -> {
                    log.error("Failed to publish OrderCancelledKafkaEvent to Kafka for orderId: {}", event.orderId(), ex);
                    throw new RuntimeException("Kafka publish failed for order cancelled event", ex);
                });
    }
}
