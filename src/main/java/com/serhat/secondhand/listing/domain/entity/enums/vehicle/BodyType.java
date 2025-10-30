package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum BodyType {
    SEDAN("Sedan"),
    HATCHBACK("Hatchback"),
    SUV("SUV"),
    COUPE("Coupe"),
    CONVERTIBLE("Convertible"),
    WAGON("Wagon"),
    PICKUP("Pickup"),
    VAN("Van"),
    OTHER("Other");

    private final String label;

    BodyType(String label) {
        this.label = label;
    }
}



