package com.serhat.secondhand.listing.domain.entity.enums.sports;

import lombok.Getter;

@Getter
public enum SportEquipmentType {
    CLEATS("Cleats"),
    JERSEY("Jersey"),
    SHORTS("Shorts"),
    SLEEVE("Sleeve"),
    BALL("Ball"),
    WRISTBAND("Wristband"),
    TREADMILL("Treadmill"),
    EXERCISE_BIKE("Exercise Bike"),
    OTHER("Other");

    private final String label;

    SportEquipmentType(String label) {
        this.label = label;
    }
}


