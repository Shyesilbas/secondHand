package com.serhat.secondhand.listing.domain.dto.request.listing;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.entity.PaymentType;

import java.util.UUID;

public record ListingPaymentRequest(
    UUID listingId,
    PaymentType paymentType,
    CreditCardDto creditCard,
    boolean agreementsAccepted,
    java.util.List<java.util.UUID> acceptedAgreementIds
) {
}