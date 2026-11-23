package com.serhat.secondhand.core.dto;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Public fee schedule: what the platform charges, read from configuration. */
public record FeeScheduleDto(
        ListingFee listingFee,
        Commission commission,
        BigDecimal shippingFee,
        /** Seller order goods total from which buyers ship free (the seller carries the fee); null when disabled. */
        BigDecimal freeShippingThreshold,
        Showcase showcase
) {
    /** Creation fee (tax included in {@code totalFee}) charged only for {@code feeBearingTypes}. */
    public record ListingFee(BigDecimal creationFee, BigDecimal taxPercentage, BigDecimal totalFee,
                             List<ListingType> feeBearingTypes) {}

    /** Commission on sales of all other types; a band applies from {@code minAmount} up to the next band. */
    public record Commission(LocalDateTime effectiveFrom, List<Band> bands) {}

    public record Band(BigDecimal minAmount, BigDecimal maxAmount, BigDecimal ratePercent) {}

    public record Showcase(BigDecimal dailyCost, BigDecimal taxPercentage) {}
}
