package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Print or pattern of an item. */
@Getter
public enum ClothingPattern {
    SOLID("Düz"),
    STRIPED("Çizgili"),
    CHECKED("Ekose"),
    PRINTED("Desenli"),
    FLORAL("Çiçekli"),
    GRAPHIC("Grafik baskılı"),
    CAMOUFLAGE("Kamuflaj"),
    POLKA_DOT("Puantiyeli"),
    ANIMAL_PRINT("Hayvan desenli");

    private final String label;

    ClothingPattern(String label) {
        this.label = label;
    }
}
