package com.serhat.secondhand.order.service;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Shared service for restoring listing stock after cancel/refund.
 * Skips VEHICLE and REAL_ESTATE listings where quantity is not meaningful.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderStockService {

    private final ListingRepository listingRepository;

    /**
     * Restores stock for a single order item by the given quantity delta.
     * Skips listings that don't track quantity (VEHICLE, REAL_ESTATE, null quantity).
     */
    public void restoreStock(OrderItem item, int delta) {
        if (item == null || delta <= 0) return;

        Listing listing = item.getListing();
        if (listing == null) return;

        ListingType type = item.getListingType();
        if (type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE) {
            return;
        }

        if (listing.getQuantity() == null) {
            return;
        }

        listingRepository.incrementQuantity(listing.getId(), delta);
        log.debug("Restored {} stock for listing {}", delta, listing.getId());
    }
}

