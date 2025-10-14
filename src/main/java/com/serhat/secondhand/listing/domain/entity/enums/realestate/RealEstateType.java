package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import lombok.Getter;

@Getter
public enum RealEstateType {
    APARTMENT("Apartment"),
    HOUSE("House"),
    VILLA("Villa"),
    LAND("Land"),
    COMMERCIAL("Commercial"),
    INDUSTRIAL("Industrial"),
    FARM("Farm"),
    RESIDENCE("Residence"),
    SUMMER_HOUSE("Summer House");

    private final String label;

    RealEstateType(String label) {
        this.label = label;
    }
}
