package com.serhat.secondhand.listing.domain.dto.request.listing;


import java.util.UUID;

public record ListingPaymentRequest(
    UUID listingId,
    String providerName,
    boolean agreementsAccepted,
    java.util.List<java.util.UUID> acceptedAgreementIds
) {
}
