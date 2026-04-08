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
public class ItemPurchasePaymentCompletedHandler implements PaymentCompletedHandler {

    private final ListingPaymentHandler listingPaymentHandler;

    @Override
    public boolean supports(Payment payment) {
        return payment != null && payment.getTransactionType() == PaymentTransactionType.ITEM_PURCHASE;
    }

    @Override
    public PaymentCompletedHandleResult handle(Payment payment) {
        Listing listing = listingPaymentHandler.handleItemPurchase(payment);
        return new PaymentCompletedHandleResult(listing != null ? listing.getTitle() : null);
    }
}

