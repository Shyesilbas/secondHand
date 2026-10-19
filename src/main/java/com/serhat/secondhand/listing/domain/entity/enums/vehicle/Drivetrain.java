package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import lombok.Getter;

@Getter
public enum Drivetrain {
    FWD("Önden Çekişli"),
    RWD("Arkadan İtişli"),
    AWD("Dört Tekerlekten Çekişli (AWD)"),
    FOUR_X_FOUR("4x4");

    private final String label;

    Drivetrain(String label) {
        this.label = label;
    }
}



