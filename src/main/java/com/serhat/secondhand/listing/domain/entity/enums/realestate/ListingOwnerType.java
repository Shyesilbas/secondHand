package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import lombok.Getter;

@Getter
public enum ListingOwnerType {
    OWNER("Owner"),
    AGENCY("Agency");

    private final String label;

    ListingOwnerType(String label) {
        this.label = label;
    }
}
