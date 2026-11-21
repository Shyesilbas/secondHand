package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;

import java.util.UUID;

/** Id and status of one of the seller's listings, enough for "select all" and batch action eligibility. */
public record ListingSelectionItem(UUID id, ListingStatus status) {}
