package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.favorite.util.FavoriteErrorCodes;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingAccessService {
    
    private final ListingRepository listingRepository;
    
        public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
    
        public Result<Void> validateActive(Listing listing) {
        if (listing == null || !listing.getStatus().equals(ListingStatus.ACTIVE)) {
            return Result.error(FavoriteErrorCodes.INACTIVE_LISTING);
        }
        return Result.success();
    }
}
