package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum Doors {
    TWO("2 Kapı"),
    THREE("3 Kapı"),
    FOUR("4 Kapı"),
    FIVE("5 Kapı");

    private final String label;

    Doors(String label) {
        this.label = label;
    }
}
