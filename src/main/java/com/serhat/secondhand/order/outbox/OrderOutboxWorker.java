package com.serhat.secondhand.order.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.order.application.OrderKafkaProducer;
import com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderOutboxWorker {

    private final OrderOutboxRepository orderOutboxRepository;
    private final OrderKafkaProducer orderKafkaProducer;
    private final ObjectMapper objectMapper;

    /** Upper bound for waiting on a broker acknowledgement; a timeout counts as a failed attempt. */
    @Value("${app.outbox.publish-timeout-seconds:15}")
    private long publishTimeoutSeconds;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutboxEvents() {
        List<OrderOutboxEvent> pendingEvents = orderOutboxRepository.findPendingEvents(
                List.of(OutboxStatus.PENDING),
                LocalDateTime.now(),
                PageRequest.of(0, 50)
        );

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Found {} pending order outbox events to process", pendingEvents.size());

        for (OrderOutboxEvent event : pendingEvents) {
            try {
                if ("ORDER_CANCELLED".equals(event.getEventType())) {
                    OrderCancelledKafkaEvent payload = objectMapper.readValue(event.getPayload(), OrderCancelledKafkaEvent.class);
                    orderKafkaProducer.publishOrderCancelled(payload).get(publishTimeoutSeconds, TimeUnit.SECONDS);
                } else if ("ORDER_REFUNDED".equals(event.getEventType())) {
                    com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent payload = objectMapper.readValue(event.getPayload(), com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent.class);
                    orderKafkaProducer.publishOrderRefunded(payload).get(publishTimeoutSeconds, TimeUnit.SECONDS);
                }

                event.setStatus(OutboxStatus.PROCESSED);
                event.setProcessedAt(LocalDateTime.now());
                event.setLastError(null);
                orderOutboxRepository.save(event);
                log.info("Successfully dispatched order outbox event: id={}, type={}", event.getId(), event.getEventType());
            } catch (Exception ex) {
                log.error("Failed to dispatch order outbox event: id={}", event.getId(), ex);
                event.setAttemptCount(event.getAttemptCount() + 1);
                event.setLastError(ex.getMessage());

                if (event.getAttemptCount() >= event.getMaxAttempts()) {
                    event.setStatus(OutboxStatus.FAILED);
                } else {
                    long backoffSeconds = (long) Math.pow(2, event.getAttemptCount());
                    event.setNextAttemptAt(LocalDateTime.now().plusSeconds(backoffSeconds));
                }
                orderOutboxRepository.save(event);
            }
        }
    }
}
