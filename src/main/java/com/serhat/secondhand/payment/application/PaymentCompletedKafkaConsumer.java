package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedKafkaConsumer {

    private final PaymentNotificationService paymentNotificationService;
    private final PaymentCompletedHandlerRegistry handlerRegistry;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @KafkaListener(
            topics = KafkaConfig.PAYMENT_COMPLETED_TOPIC,
            groupId = "${app.kafka.consumer.payment-completed-group:payment-completed-consumers}"
    )
    @org.springframework.transaction.annotation.Transactional
    public void consumePaymentCompleted(PaymentCompletedKafkaEvent event) {
        log.info("Received PaymentCompletedKafkaEvent from Kafka: paymentId={}, idempotencyKey={}",
                event.paymentId(), event.idempotencyKey());

        // Idempotency check: check if already processed
        String idempotencyKey = "processed:payment:completed:" + event.paymentId();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(idempotencyKey))) {
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
                        log.info("Payment success notification sent to sender ID: {}", sender.getId());
                    });
                }

                if (event.toUserId() != null && !event.toUserId().equals(event.fromUserId())) {
                    userRepository.findById(event.toUserId()).ifPresent(receiver -> {
                        paymentNotificationService.sendPaymentSuccessNotification(receiver, paymentDto);
                        log.info("Payment success notification sent to receiver ID: {}", receiver.getId());
                    });
                }

                // Mark in Redis ONLY after DB transaction successfully commits!
                if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
                    org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                            new org.springframework.transaction.support.TransactionSynchronization() {
                                @Override
                                public void afterCommit() {
                                    redisTemplate.opsForValue().set(idempotencyKey, "PROCESSED", java.time.Duration.ofDays(7));
                                    log.debug("Marked idempotency key {} in Redis after successful commit.", idempotencyKey);
                                }
                            }
                    );
                } else {
                    redisTemplate.opsForValue().set(idempotencyKey, "PROCESSED", java.time.Duration.ofDays(7));
                }
            });
        } catch (Exception ex) {
            log.error("Error processing PaymentCompletedKafkaEvent for paymentId: {}", event.paymentId(), ex);
            throw ex; // Re-throw to allow Kafka error handler / DLQ mechanisms to handle it
        }
    }
}
