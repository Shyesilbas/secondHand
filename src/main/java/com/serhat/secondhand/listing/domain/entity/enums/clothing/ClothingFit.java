package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Cut of an apparel item. */
@Getter
public enum ClothingFit {
    SLIM("Slim fit"),
    REGULAR("Regular fit"),
    OVERSIZE("Oversize"),
    RELAXED("Rahat kesim"),
    SKINNY("Skinny"),
    LOOSE("Bol kesim"),
    ATHLETIC("Atletik kesim");

    private final String label;

    ClothingFit(String label) {
        this.label = label;
    }
}
