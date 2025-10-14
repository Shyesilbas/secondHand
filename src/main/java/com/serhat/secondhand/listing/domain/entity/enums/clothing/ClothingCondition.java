package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingCondition {
    EXCELLENT("Excellent"),
    GOOD("Good"),
    FAIR("Fair"),
    WORN("Worn"),
    DAMAGED("Damaged");

    private final String label;

    ClothingCondition(String label) {
        this.label = label;
    }
}
