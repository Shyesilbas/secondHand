package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingEventListener {

    private final ListingRepository listingRepository;
    private final ListingCommandService listingCommandService;

    @EventListener
    @Transactional
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        Payment payment = event.getPayment();
        log.info("Handling Payment Completed Event for payment ID: {} and listing ID: {}", payment.getId(), payment.getListingId());

        if (payment.getListingId() == null) {
            log.warn("Payment {} has no associated listing ID. Skipping.", payment.getId());
            return;
        }

        Listing listing = listingRepository.findById(payment.getListingId())
                .orElseThrow(() -> new BusinessException("Listing not found for payment: " + payment.getId(),
                        HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        if (payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION) {
            var fromUser = payment.getFromUser();
            Long userId = fromUser != null ? fromUser.getId() : null;
            if (userId != null) {
                listing.setListingFeePaid(true);
                listingRepository.save(listing);
                listingCommandService.publish(listing.getId(), userId);
            }
        } else if (payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE) {
            if (listing.getStatus() != null) {
                log.info("Purchase completed for listing {}. Status change disabled; keeping {}.", listing.getId(), listing.getStatus());
            }
        }
    }
}
