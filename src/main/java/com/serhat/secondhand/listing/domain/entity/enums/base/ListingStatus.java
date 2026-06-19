package com.serhat.secondhand.listing.domain.entity.enums.base;

import lombok.Getter;

@Getter
public enum ListingStatus {
    ACTIVE("Active"),
    RESERVED("Reserved"),
    INACTIVE("Inactive"),
    DRAFT("Draft"),
    SOLD("Sold"),
    DELETED("Deleted");

    private final String label;

    ListingStatus(String label) {
        this.label = label;
    }
}
