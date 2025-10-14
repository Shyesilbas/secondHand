package com.serhat.secondhand.listing.domain.entity.enums.sports;

import lombok.Getter;

@Getter
public enum SportDiscipline {
    FOOTBALL("Football"),
    BASKETBALL("Basketball"),
    TENNIS("Tennis"),
    VOLLEYBALL("Volleyball"),
    RUNNING("Running"),
    CYCLING("Cycling"),
    OTHER("Other");

    private final String label;

    SportDiscipline(String label) {
        this.label = label;
    }
}


