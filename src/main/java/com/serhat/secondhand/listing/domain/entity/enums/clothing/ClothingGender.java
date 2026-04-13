package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingGender {
    MALE("Male"),
    FEMALE("Female"),
    UNISEX("Unisex");

    private final String label;

    ClothingGender(String label) {
        this.label = label;
    }
}
