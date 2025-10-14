package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum ListingType {
    VEHICLE("Vehicle"),
    ELECTRONICS("Electronics"), 
    REAL_ESTATE("Real Estate"),
    CLOTHING("Clothing"),
    BOOKS("Books"),
    SPORTS("Sports"),
    OTHER("Other");

    private final String label;

    ListingType(String label) {
        this.label = label;
    }
}