package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum BodyType {
    // Car body types
    SEDAN("Sedan"),
    HATCHBACK("Hatchback"),
    SUV("SUV"),
    COUPE("Coupe"),
    CONVERTIBLE("Cabrio"),
    WAGON("Station Wagon"),
    PICKUP("Pick-up"),
    VAN("Van"),
    MPV("MPV"),
    OTHER("Diğer"),
    // Motorcycle body types
    SPORTBIKE("Spor Motosiklet"),
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



