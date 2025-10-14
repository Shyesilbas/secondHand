package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum GearType {
    MANUAL("Manuel"),
    AUTOMATIC("Automatic"),
    SEMI_AUTOMATIC("Semi Automatic"),
    CVT("CVT");

    private final String label;

    GearType(String label) {
        this.label = label;
    }
}