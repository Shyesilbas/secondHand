package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Who the item is for; replaces the old gender + category pair. Picks the size systems with the type. */
@Getter
public enum ClothingAudience {
    WOMEN("Kadın"),
    MEN("Erkek"),
    UNISEX("Unisex"),
    GIRL("Kız çocuk"),
    BOY("Erkek çocuk"),
    BABY("Bebek");

    private final String label;

    ClothingAudience(String label) {
        this.label = label;
    }
}
