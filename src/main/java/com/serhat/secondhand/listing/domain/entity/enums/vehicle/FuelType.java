package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum FuelType {
    HYBRID("Hybrid"),
    DIESEL("Diesel"),
    GASOLINE("Gasoline"),
    ELECTRIC("Electric"),
    LPG("LPG");

    private final String label;

    FuelType(String label) {
        this.label = label;
    }
}
