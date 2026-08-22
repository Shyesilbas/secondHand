package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryKafkaConsumer {

    private final InventoryService inventoryService;
    private final ListingRepository listingRepository;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @KafkaListener(
            topics = KafkaConfig.PAYMENT_COMPLETED_TOPIC,
            groupId = "${app.kafka.consumer.inventory-group:inventory-sync-consumers}"
    )
    @Transactional
    public void consumePaymentCompleted(PaymentCompletedKafkaEvent event) {
        if (event.listingId() == null) {
            log.debug("PaymentCompletedKafkaEvent {} has no listingId, skipping inventory deduction.", event.paymentId());
            return;
        }

        // Idempotency Check: check if already processed
        String idempotencyKey = "processed:inventory:payment:" + event.paymentId();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(idempotencyKey))) {
            log.warn("Duplicate PaymentCompletedKafkaEvent detected for paymentId: {}. Skipping duplicate inventory deduction.", event.paymentId());
            return;
        }

        log.info("Processing asynchronous inventory deduction for listingId: {} from paymentId: {}",
                event.listingId(), event.paymentId());

        try {
            int quantityToDeduct = (event.quantity() != null && event.quantity() > 0) ? event.quantity() : 1;
            // Deduct from PostgreSQL Inventory record
            inventoryService.reserveQuantity(event.listingId(), quantityToDeduct);

            // Check if listing has zero available stock left to update listing status
            int remainingStock = inventoryService.getAvailableQuantity(event.listingId());
            if (remainingStock <= 0) {
                listingRepository.findById(event.listingId()).ifPresent(listing -> {
                    listing.setStatus(com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus.SOLD);
                    listingRepository.save(listing);
                    log.info("Listing {} stock reached 0, updated status to SOLD in database.", event.listingId());
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

            log.info("Successfully deducted database inventory for listingId: {}. Remaining stock: {}",
                    event.listingId(), remainingStock);

        } catch (Exception e) {
            log.error("Failed to deduct inventory for listingId: {} on paymentId: {}",
                    event.listingId(), event.paymentId(), e);
            throw e; // Allows Kafka retry / DLQ mechanisms
        }
    }
}
