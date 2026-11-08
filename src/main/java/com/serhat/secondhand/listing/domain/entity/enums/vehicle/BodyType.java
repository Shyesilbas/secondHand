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
    MPV("MPV"),
    OTHER("Diğer"),
    // Light commercial body types
    VAN("Panelvan"),
    COMBI("Kombi"),
    MINIBUS("Minibüs"),
    PICKUP("Pick-up"),
    LIGHT_TRUCK("Kamyonet"),
    // Heavy vehicle body types
    TRUCK("Kamyon"),
    TRACTOR("Çekici"),
    TIPPER("Damperli"),
    BUS("Otobüs"),
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



