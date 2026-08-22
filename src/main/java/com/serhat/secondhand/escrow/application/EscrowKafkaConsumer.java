package com.serhat.secondhand.escrow.application;

import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowKafkaConsumer {

    private final IEWalletService walletService;
    private final UserRepository userRepository;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @KafkaListener(
            topics = EscrowKafkaProducer.ESCROW_RELEASED_TOPIC,
            groupId = "${app.kafka.consumer.escrow-released-group:escrow-released-consumers}"
    )
    @Transactional
    public void consumeEscrowReleased(EscrowReleasedKafkaEvent event) {
        log.info("Received EscrowReleasedKafkaEvent from Kafka: escrowId={}, orderNumber={}, sellerId={}, amount={}",
                event.escrowId(), event.orderNumber(), event.sellerId(), event.amount());

        if (event.sellerId() == null || event.amount() == null) {
            log.warn("EscrowReleasedKafkaEvent has missing sellerId or amount, skipping wallet credit.");
            return;
        }

        // Idempotency Check: Prevent duplicate wallet credit if Kafka redelivers this event
        String idempotencyKey = "processed:escrow:release:" + event.escrowId();
        Boolean isFirstDelivery = redisTemplate.opsForValue().setIfAbsent(idempotencyKey, "PROCESSED", java.time.Duration.ofDays(7));
        if (Boolean.FALSE.equals(isFirstDelivery)) {
            log.warn("Duplicate EscrowReleasedKafkaEvent detected for escrowId: {}. Skipping duplicate wallet credit.", event.escrowId());
            return;
        }

        try {
            userRepository.findById(event.sellerId()).ifPresentOrElse(seller -> {
                walletService.creditWalletQuietly(seller, event.amount());
                log.info("Successfully credited {} to seller {} wallet asynchronously via Kafka.",
                        event.amount(), seller.getEmail());
            }, () -> log.error("Seller with ID {} not found for escrow release credit.", event.sellerId()));
        } catch (Exception ex) {
            // Remove idempotency key on failure so it can be retried safely
            redisTemplate.delete(idempotencyKey);
            log.error("Failed to credit seller wallet for escrowId: {}, sellerId: {}",
                    event.escrowId(), event.sellerId(), ex);
            throw ex;
        }
    }
}
