package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingPaymentHandler {

    private final ListingRepository listingRepository;
    private final ListingCommandService listingCommandService;

    @Transactional(readOnly = true)
    public Listing resolveListing(Payment payment) {
        if (payment.getListingId() == null) {
            return null;
        }
        return listingRepository.findById(payment.getListingId())
                .orElseThrow(() -> new BusinessException("Listing not found for payment: " + payment.getId(),
                        HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
    }

    @Transactional
    public Listing handleListingCreation(Payment payment) {
        Listing listing = resolveListing(payment);
        if (listing == null) {
            log.warn("Payment {} has no associated listing ID for LISTING_CREATION.", payment.getId());
            return null;
        }
        Long userId = listing.getSeller() != null ? listing.getSeller().getId() : null;
        Long payerId = payment.getFromUser() != null ? payment.getFromUser().getId() : null;
        if (userId == null || !userId.equals(payerId)) {
            log.error("LISTING_CREATION payment {} was made by user {} but listing {} belongs to {}; not publishing.",
                    payment.getId(), payerId, listing.getId(), userId);
            return null;
        }
        BigDecimal requiredFee = listingCommandService.calculateTotalListingFee();
        if (payment.getAmount() == null || payment.getAmount().compareTo(requiredFee) < 0) {
            log.error("LISTING_CREATION payment {} amount {} is below the listing fee {}; not publishing listing {}.",
                    payment.getId(), payment.getAmount(), requiredFee, listing.getId());
            return null;
        }
        listing.markFeeAsPaid();
        listingRepository.save(listing);
        listingCommandService.publish(listing.getId(), userId);
        return listing;
    }

    @Transactional(readOnly = true)
    public Listing handleItemPurchase(Payment payment) {
        Listing listing = resolveListing(payment);
        if (listing != null && listing.getStatus() != null) {
            log.info("Purchase completed for listing {}. Status change disabled; keeping {}.", listing.getId(), listing.getStatus());
        }
        return listing;
    }
}



