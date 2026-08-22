package com.serhat.secondhand.order.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
        } catch (Exception ex) {
            log.error("Failed to enqueue ORDER_CANCELLED event for orderId: {}", event.orderId(), ex);
            throw new RuntimeException("Failed to enqueue outbox event", ex);
        }
    }
}
