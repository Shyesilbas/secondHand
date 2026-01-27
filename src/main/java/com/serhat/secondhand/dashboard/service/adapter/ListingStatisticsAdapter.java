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
    public List<Listing> findBySellerId(Long sellerId) {
        return listingRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Listing> findBySellerIdAndStatus(Long sellerId, ListingStatus status) {
        return listingRepository.findBySellerIdAndStatus(sellerId, status);
    }

    @Override
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
}

