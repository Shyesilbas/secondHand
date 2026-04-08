package com.serhat.secondhand.payment.application.handlers;

import com.serhat.secondhand.listing.application.common.ListingPaymentHandler;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.application.PaymentCompletedHandleResult;
import com.serhat.secondhand.payment.application.PaymentCompletedHandler;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingCreationPaymentCompletedHandler implements PaymentCompletedHandler {

    private final ListingPaymentHandler listingPaymentHandler;

    @Override
    public boolean supports(Payment payment) {
        return payment != null && payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION;
    }

    @Override
    public PaymentCompletedHandleResult handle(Payment payment) {
        Listing listing = listingPaymentHandler.handleListingCreation(payment);
        return new PaymentCompletedHandleResult(listing != null ? listing.getTitle() : null);
    }
}

