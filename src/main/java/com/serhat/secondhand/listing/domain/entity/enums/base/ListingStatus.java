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

    /** Statuses anyone may browse; draft, inactive, reserved and deleted listings stay owner-only. */
    public boolean isPublicBrowsable() {
        return this == ACTIVE || this == SOLD;
    }
}
