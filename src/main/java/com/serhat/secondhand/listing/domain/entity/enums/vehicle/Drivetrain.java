package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum Drivetrain {
    FWD("Front-Wheel Drive"),
    RWD("Rear-Wheel Drive"),
    AWD("All-Wheel Drive"),
    FOUR_X_FOUR("4x4");

    private final String label;

    Drivetrain(String label) {
        this.label = label;
    }
}



