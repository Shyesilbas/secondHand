package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum ListingStatus {
    ACTIVE("Active"),
    RESERVED("Reserved"),
    INACTIVE("Inactive"),
    DRAFT("Draft"),
    SOLD("Sold");

    private final String label;

    ListingStatus(String label) {
        this.label = label;
    }
}
