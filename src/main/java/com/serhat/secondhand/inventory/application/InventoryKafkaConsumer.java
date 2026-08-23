package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
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
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

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

        // Atomic DB-Level Idempotency Check: INSERT ON CONFLICT DO NOTHING within the same ACID Transaction
        String dedupeKey = "inventory:payment:" + event.paymentId();
        int inserted = processedKafkaEventRepository.insertIfNotExists(dedupeKey, "inventory-sync-consumers");
        if (inserted == 0) {
            log.warn("Duplicate PaymentCompletedKafkaEvent detected for paymentId: {}. Skipping duplicate inventory deduction.", event.paymentId());
            return;
        }

        // Verify listing exists in database before attempting DB inventory deduction
        if (!listingRepository.existsById(event.listingId())) {
            log.warn("Listing {} no longer exists in database, skipping inventory deduction for paymentId: {}",
                    event.listingId(), event.paymentId());
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
                    listing.setStatus(ListingStatus.SOLD);
                    listingRepository.save(listing);
                    log.info("Listing {} stock reached 0, updated status to SOLD in database.", event.listingId());
                });
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
