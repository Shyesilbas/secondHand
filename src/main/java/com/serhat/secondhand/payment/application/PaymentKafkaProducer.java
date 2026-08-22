package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import com.serhat.secondhand.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentCompleted(Payment payment) {
        String key = payment.getFromUser() != null ? String.valueOf(payment.getFromUser().getId()) : payment.getId().toString();

        PaymentCompletedKafkaEvent event = new PaymentCompletedKafkaEvent(
                payment.getId(),
                payment.getIdempotencyKey(),
                payment.getFromUser() != null ? payment.getFromUser().getId() : null,
                payment.getFromUser() != null ? payment.getFromUser().getEmail() : null,
                payment.getToUser() != null ? payment.getToUser().getId() : null,
                payment.getToUser() != null ? payment.getToUser().getEmail() : null,
                payment.getAmount(),
                payment.getCurrency() != null ? payment.getCurrency() : "TRY",
                payment.getProviderName(),
                payment.getListingId(),
                payment.getOrderItemId(),
                payment.getStatus() != null ? payment.getStatus().name() : "COMPLETED",
                payment.getProcessedAt() != null ? payment.getProcessedAt() : LocalDateTime.now()
        );

        log.info("Publishing PaymentCompletedKafkaEvent to Kafka topic: {} with key: {}", KafkaConfig.PAYMENT_COMPLETED_TOPIC, key);
        kafkaTemplate.send(KafkaConfig.PAYMENT_COMPLETED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to send PaymentCompletedKafkaEvent for paymentId: {}", payment.getId(), ex);
                    } else {
                        log.info("Successfully sent PaymentCompletedKafkaEvent for paymentId: {} offset: {}",
                                payment.getId(), result.getRecordMetadata().offset());
                    }
                });
    }
}
