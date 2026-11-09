package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Second-hand clothing condition; FLAWED needs at least one {@code defects} attribute. */
@Getter
public enum ClothingCondition {
    NEW_WITH_TAGS("Yeni, etiketli"),
    NEW_WITHOUT_TAGS("Yeni, etiketsiz"),
    VERY_GOOD("Çok iyi"),
    GOOD("İyi"),
    FLAWED("Kusurlu");

    private final String label;

    ClothingCondition(String label) {
        this.label = label;
    }
}
