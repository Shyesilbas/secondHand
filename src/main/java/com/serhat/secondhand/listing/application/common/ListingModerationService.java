package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * System-initiated listing takedowns for complaint moderation. No owner check: the caller is the
 * moderation engine, never a user request. Only ACTIVE listings move to INACTIVE; sellers re-publish
 * them themselves after a ban (proposal section 5.5). Joins the caller's transaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ListingModerationService {

    static final int PAGE_SIZE = 200;
    /** Guards against a loop if deactivation does not persist (50 x 200 = 10,000 listings). */
    static final int MAX_PASSES = 50;

    private final ListingRepository listingRepository;

    /** Returns true when the listing was ACTIVE and is now INACTIVE. */
    @Transactional(propagation = Propagation.MANDATORY)
    @CacheEvict(cacheNames = "user:profile", allEntries = true)
    public boolean suspend(UUID listingId) {
        Listing listing = listingRepository.findById(listingId).orElse(null);
        if (listing == null || listing.getStatus() != ListingStatus.ACTIVE) {
            return false;
        }
        listing.deactivate();
        listingRepository.save(listing);
        log.warn("Listing {} suspended by moderation", listingId);
        return true;
    }

    /** Deactivates every ACTIVE listing of the seller; returns how many changed. */
    @Transactional(propagation = Propagation.MANDATORY)
    @CacheEvict(cacheNames = "user:profile", allEntries = true)
    public int suspendAllActive(Long sellerId) {
        int total = 0;
        for (int pass = 0; ; pass++) {
            if (pass >= MAX_PASSES) {
                throw new IllegalStateException("Listings of seller " + sellerId + " stay ACTIVE after " + MAX_PASSES + " passes");
            }
            // Always page 0: each pass removes the listings it handled from the ACTIVE set.
            Page<Listing> page = listingRepository.findBySellerIdAndStatus(sellerId, ListingStatus.ACTIVE, PageRequest.of(0, PAGE_SIZE));
            if (page.isEmpty()) {
                break;
            }
            for (Listing listing : page) {
                listing.deactivate();
            }
            listingRepository.saveAll(page.getContent());
            listingRepository.flush();
            total += page.getNumberOfElements();
        }
        log.warn("{} active listing(s) of seller {} suspended by moderation", total, sellerId);
        return total;
    }
}
