package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum Doors {
    TWO("2 Doors"),
    FOUR("4 Doors");

    private final String label;

    Doors(String label) {
        this.label = label;
    }
}
