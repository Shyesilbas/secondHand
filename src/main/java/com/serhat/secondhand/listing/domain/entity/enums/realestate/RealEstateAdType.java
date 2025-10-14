package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import lombok.Getter;

@Getter
public enum RealEstateAdType {
    FOR_SALE("For Sale"),
    FOR_RENT("For Rent");

    private final String label;

    RealEstateAdType(String label) {
        this.label = label;
    }
}
