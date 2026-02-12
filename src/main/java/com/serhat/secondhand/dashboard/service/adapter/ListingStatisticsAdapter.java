package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.ListingStatisticsPort;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListingStatisticsAdapter implements ListingStatisticsPort {

    private final ListingRepository listingRepository;

    @Override
    public long countBySellerId(Long sellerId) {
        return listingRepository.countBySellerId(sellerId);
    }

    @Override
    public long countBySellerIdAndStatus(Long sellerId, ListingStatus status) {
        return listingRepository.countBySellerIdAndStatus(sellerId, status);
    }

    @Override
    public List<Listing> findAllByIdIn(List<UUID> ids) {
        return listingRepository.findAllById(ids);
    }

    @Override
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    @Override
    public long getTotalListingCount() {
        return listingRepository.getTotalListingCount();
    }

    @Override
    public long getListingCountByStatus(ListingStatus status) {
        return listingRepository.getListingCountByStatus(status);
    }

    @Override
    public long getActiveSellerCount(ListingStatus status) {
        return listingRepository.getActiveSellerCount(status);
    }

    @Override
    public long getActiveCityCount(ListingStatus status) {
        return listingRepository.getActiveCityCount(status);
    }

    @Override
    public List<Object[]> getActiveCountsByType(ListingStatus status) {
        return listingRepository.getActiveCountsByType(status);
    }
}