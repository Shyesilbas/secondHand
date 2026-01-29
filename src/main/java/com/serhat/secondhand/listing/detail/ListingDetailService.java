package com.serhat.secondhand.listing.detail;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ListingDetailService {

    private final ListingRepository listingRepository;
    private final List<ListingDetailStrategy> strategies;

    public String getCombinedSummary(UUID listingId) {
        Listing listing = listingRepository.findById(listingId).orElse(null);
        if (listing == null) {
            return "İlan bulunamadı.";
        }

        ListingType type = listing.getListingType();
        ListingDetailStrategy strategy = strategies.stream()
                .filter(s -> s.supports(type))
                .findFirst()
                .orElse(null);

        if (strategy != null) {
            String detail = strategy.getDetailSummary(listingId);
            if (detail != null && !detail.isBlank()) {
                return detail;
            }
        }

        return buildFallbackSummary(listing);
    }

    private String buildFallbackSummary(Listing listing) {
        String title = listing.getTitle();
        if (title == null || title.isBlank()) {
            title = "İlan";
        }

        if (listing.getPrice() == null) {
            return title;
        }

        String price = listing.getPrice().toPlainString();
        return title + " - " + price;
    }
}

