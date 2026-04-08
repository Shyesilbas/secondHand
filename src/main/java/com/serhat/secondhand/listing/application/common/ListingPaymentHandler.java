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
        if (userId != null) {
            listing.setListingFeePaid(true);
            listingRepository.save(listing);
            listingCommandService.publish(listing.getId(), userId);
        }
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



