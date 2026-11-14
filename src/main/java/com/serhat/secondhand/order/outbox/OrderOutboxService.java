package com.serhat.secondhand.order.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderOutboxService {

    private final OrderOutboxRepository orderOutboxRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void enqueueOrderCancelled(OrderCancelledKafkaEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);

            OrderOutboxEvent outboxEvent = OrderOutboxEvent.builder()
                    .eventType("ORDER_CANCELLED")
                    .aggregateType("Order")
                    .aggregateId(String.valueOf(event.orderId()))
                    .payload(payload)
                    .status(OutboxStatus.PENDING)
                    .nextAttemptAt(LocalDateTime.now())
                    .build();

            orderOutboxRepository.save(outboxEvent);
            log.info("OrderOutboxEvent enqueued: eventType=ORDER_CANCELLED, orderId={}", event.orderId());
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize ORDER_CANCELLED event for orderId: {}", event.orderId(), ex);
            throw new IllegalStateException("Failed to serialize ORDER_CANCELLED outbox event", ex);
        }
    }

    @Transactional
    public void enqueueOrderRefunded(com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);

            OrderOutboxEvent outboxEvent = OrderOutboxEvent.builder()
                    .eventType("ORDER_REFUNDED")
                    .aggregateType("Order")
                    .aggregateId(String.valueOf(event.orderId()))
                    .payload(payload)
                    .status(OutboxStatus.PENDING)
                    .nextAttemptAt(LocalDateTime.now())
                    .build();

            orderOutboxRepository.save(outboxEvent);
            log.info("OrderOutboxEvent enqueued: eventType=ORDER_REFUNDED, orderId={}", event.orderId());
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize ORDER_REFUNDED event for orderId: {}", event.orderId(), ex);
            throw new IllegalStateException("Failed to serialize ORDER_REFUNDED outbox event", ex);
        }
    }
}
