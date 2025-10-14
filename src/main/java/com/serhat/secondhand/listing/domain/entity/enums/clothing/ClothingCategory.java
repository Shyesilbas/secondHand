package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingCategory {
    BOY_CHILD("Boy Child"),
    GIRL_CHILD("Girl Child"),
    BOY_BABY("Boy Baby"),
    GIRL_BABY("Girl Baby"),
    BOY_YOUTH("Boy Youth"),
    GIRL_YOUTH("Girl Youth"),
    MALE_ADULT("Male Adult"),
    FEMALE_ADULT("Female Adult"),
    UNISEX("Unisex");

    private final String label;

    ClothingCategory(String label) {
        this.label = label;
    }
}
