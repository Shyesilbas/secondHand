package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum GearType {
    MANUAL("Manuel"),
    AUTOMATIC("Otomatik"),
    SEMI_AUTOMATIC("Yarı Otomatik"),
    CVT("CVT");

    private final String label;

    GearType(String label) {
        this.label = label;
    }
}