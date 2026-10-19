package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingCategory {
    BOY_CHILD("Erkek Çocuk"),
    GIRL_CHILD("Kız Çocuk"),
    BOY_BABY("Erkek Bebek"),
    GIRL_BABY("Kız Bebek"),
    BOY_YOUTH("Genç Erkek"),
    GIRL_YOUTH("Genç Kız"),
    MALE_ADULT("Yetişkin Erkek"),
    FEMALE_ADULT("Yetişkin Kadın"),
    UNISEX("Unisex");

    private final String label;

    ClothingCategory(String label) {
        this.label = label;
    }
}
