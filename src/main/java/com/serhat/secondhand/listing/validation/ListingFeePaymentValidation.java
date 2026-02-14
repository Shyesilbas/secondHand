package com.serhat.secondhand.listing.validation;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingFeePaymentValidation {

    private final IListingService listingService;

    public Result<Void> validate(PaymentRequest request, Long userId) {

        Listing listing = listingService.findById(request.listingId())
                .orElse(null);

        if (listing == null) {
            return Result.error(PaymentErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> ownershipValidation = listingService.validateOwnership(
                listing.getId(),
                userId
        );

        if (ownershipValidation.isError()) {
            return ownershipValidation;
        }

        if (listing.getStatus() != ListingStatus.DRAFT) {
            return Result.error(PaymentErrorCodes.LISTING_FEE_PAYMENT_NOT_ALLOWED_FOR_STATUS);
        }

        return Result.success();
    }
}
