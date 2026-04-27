package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingValidationService {

    private final ListingRepository listingRepository;

    public Listing findAndValidateOwner(UUID listingId, Long userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        if (!listing.isOwnedBy(userId)) {
            throw new BusinessException(ListingErrorCodes.NOT_LISTING_OWNER);
        }
        return listing;
    }

    public Result<Void> validateOwnership(UUID listingId, Long userId) {
        return listingRepository.findById(listingId)
                .map(listing -> listing.isOwnedBy(userId)
                        ? Result.<Void>success()
                        : Result.<Void>error(ListingErrorCodes.NOT_LISTING_OWNER))
                .orElse(Result.error(ListingErrorCodes.LISTING_NOT_FOUND));
    }


    public Result<Void> validateQuantity(Integer quantity) {
        if (quantity == null || quantity < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }
        return Result.success();
    }
}

