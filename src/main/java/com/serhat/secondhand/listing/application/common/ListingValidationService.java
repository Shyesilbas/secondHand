package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
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
        if (!listing.getSeller().getId().equals(userId)) {
            throw new BusinessException(ListingErrorCodes.NOT_LISTING_OWNER);
        }
        return listing;
    }

    public Result<Void> validateOwnership(UUID listingId, Long userId) {
        return listingRepository.findById(listingId)
                .map(listing -> listing.getSeller().getId().equals(userId)
                        ? Result.<Void>success()
                        : Result.<Void>error(ListingErrorCodes.NOT_LISTING_OWNER))
                .orElse(Result.error(ListingErrorCodes.LISTING_NOT_FOUND));
    }

    public Result<Void> validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        for (ListingStatus allowedStatus : allowedStatuses) {
            if (listing.getStatus() == allowedStatus) return Result.success();
        }
        return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
    }

    public Result<Void> validateEditableStatus(Listing listing) {
        return validateStatus(listing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
    }

    public Result<Void> applyQuantityUpdate(Listing listing, Optional<Integer> quantity) {
        if (listing == null) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_LISTING_REQUIRED,
                    ListingBusinessConstants.ERROR_CODE_LISTING_REQUIRED);
        }
        if (quantity == null || quantity.isEmpty()) {
            return Result.success();
        }
        Integer q = quantity.get();
        if (q == null || q < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_QUANTITY_AT_LEAST_ONE,
                    ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        listing.setQuantity(q);
        return Result.success();
    }
}

