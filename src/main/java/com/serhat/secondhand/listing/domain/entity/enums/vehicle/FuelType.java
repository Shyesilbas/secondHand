package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum FuelType {
    HYBRID("Hibrit"),
    DIESEL("Dizel"),
    GASOLINE("Benzin"),
    ELECTRIC("Elektrikli"),
    LPG("LPG");

    private final String label;

    FuelType(String label) {
        this.label = label;
    }
}
