package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingGender {
    MALE("Erkek"),
    FEMALE("Kadın"),
    UNISEX("Unisex");

    private final String label;

    ClothingGender(String label) {
        this.label = label;
    }
}
