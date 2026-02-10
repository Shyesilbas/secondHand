package com.serhat.secondhand.listing.validation;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingFeePaymentValidation {

    private final ListingService listingService;

    public Result<Void> validate(PaymentRequest request, Long userId) {

        Listing listing = listingService.findById(request.listingId()).orElse(null);
        if (listing == null) {
            return Result.error(PaymentErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
        }

        Result<Void> ownershipResult = listingService.validateOwnership(request.listingId(), userId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getErrorCode(), ownershipResult.getMessage());
        }

        ListingStatus status = listing.getStatus();
        if (status == ListingStatus.DRAFT) {
            return Result.success("Listing fee paid successfully");
        }
        else{
            return Result.error(PaymentErrorCodes.LISTING_FEE_PAYMENT_NOT_ALLOWED_FOR_STATUS.toString(), "Listing fee payment is not allowed.");
        }
    }

}
