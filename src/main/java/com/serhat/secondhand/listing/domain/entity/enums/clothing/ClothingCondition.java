package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingCondition {
    EXCELLENT("Mükemmel"),
    GOOD("İyi"),
    FAIR("Orta"),
    WORN("Yıpranmış"),
    DAMAGED("Hasarlı");

    private final String label;

    ClothingCondition(String label) {
        this.label = label;
    }
}
