package com.serhat.secondhand.listing.application.port;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.dto.request.listing.ListingFeePaymentRequest;

import java.util.UUID;

public interface ListingFeePaymentPort {
    
    Result<UUID> processListingFee(ListingFeePaymentRequest request);
    
    boolean isPaymentCompleted(UUID paymentId);
}
