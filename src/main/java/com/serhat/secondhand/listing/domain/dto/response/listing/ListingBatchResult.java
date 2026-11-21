package com.serhat.secondhand.listing.domain.dto.response.listing;

/** Outcome of a seller-wide batch change: how many listings it changed (0 when none matched). */
public record ListingBatchResult(int updatedCount) {}
