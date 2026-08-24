package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedKafkaConsumer {

    private final PaymentNotificationService paymentNotificationService;
    private final PaymentCompletedHandlerRegistry handlerRegistry;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @KafkaListener(
            topics = KafkaConfig.PAYMENT_COMPLETED_TOPIC,
            groupId = "${app.kafka.consumer.payment-completed-group:payment-completed-consumers}"
    )
    @Transactional
    public void consumePaymentCompleted(PaymentCompletedKafkaEvent event) {
        log.info("Received PaymentCompletedKafkaEvent from Kafka: paymentId={}, idempotencyKey={}",
                event.paymentId(), event.idempotencyKey());

        // Atomic DB-Level Idempotency Check: INSERT ON CONFLICT DO NOTHING within the same ACID Transaction
        String dedupeKey = "payment:completed:" + event.paymentId();
        int inserted = processedKafkaEventRepository.insertIfNotExists(dedupeKey, "payment-completed-consumers");
        if (inserted == 0) {
            log.warn("Duplicate PaymentCompletedKafkaEvent detected for paymentId: {}. Skipping duplicate notification.", event.paymentId());
            return;
        }

        try {
            paymentRepository.findById(event.paymentId()).ifPresent(payment -> {
                handlerRegistry.handle(payment);

                PaymentDto paymentDto = paymentMapper.toDto(payment);

                if (event.fromUserId() != null) {
                    userRepository.findById(event.fromUserId()).ifPresent(sender -> {
                        paymentNotificationService.sendPaymentSuccessNotification(sender, paymentDto);
                        log.info("Payment success notification sent to payer ID: {}", sender.getId());
                    });
                }
            });
        } catch (Exception ex) {
            log.error("Error processing PaymentCompletedKafkaEvent for paymentId: {}", event.paymentId(), ex);
            throw ex; // Re-throw to allow Kafka error handler / DLQ mechanisms to handle it
        }
    }
}
