package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum SeatCount {
    TWO("2"),
    FOUR("4"),
    FIVE("5"),
    SEVEN("7"),
    EIGHT("8"),
    NINE("9"),
    TEN("10"),
    MORE_THAN_TEN("10+");

    private final String label;

    SeatCount(String label) {
        this.label = label;
    }
}