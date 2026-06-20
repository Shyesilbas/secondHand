package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum BodyType {
    // Car body types
    SEDAN("Sedan"),
    HATCHBACK("Hatchback"),
    SUV("SUV"),
    COUPE("Coupe"),
    CONVERTIBLE("Convertible"),
    WAGON("Wagon"),
    PICKUP("Pickup"),
    VAN("Van"),
    MPV("MPV"),
    OTHER("Other"),
    // Motorcycle body types
    SPORTBIKE("Sportbike"),
    NAKED("Naked"),
    SCOOTER("Scooter"),
    ADVENTURE("Adventure"),
    ENDURO("Enduro"),
    TOURING("Touring"),
    CRUISER("Cruiser");

    private final String label;

    BodyType(String label) {
        this.label = label;
    }
}



