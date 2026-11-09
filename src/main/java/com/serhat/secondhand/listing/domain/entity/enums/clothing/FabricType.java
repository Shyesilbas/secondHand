package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Main fabric or material of an item. */
@Getter
public enum FabricType {
    COTTON("Pamuk"),
    POLYESTER("Polyester"),
    WOOL("Yün"),
    SILK("İpek"),
    DENIM("Denim"),
    LEATHER("Deri"),
    LINEN("Keten"),
    SYNTHETIC("Sentetik"),
    BLEND("Karışım"),
    NYLON("Naylon"),
    VELVET("Kadife"),
    FLEECE("Polar"),
    CASHMERE("Kaşmir"),
    VISCOSE("Viskon");

    private final String label;

    FabricType(String label) {
        this.label = label;
    }
}
