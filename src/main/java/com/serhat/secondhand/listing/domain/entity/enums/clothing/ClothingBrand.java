package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingBrand {
    NIKE("Nike"),
    ADIDAS("Adidas"),
    PUMA("Puma"),
    UNDER_ARMOUR("Under Armour"),
    ZARA("Zara"),
    H_M("H&M"),
    UNIQLO("Uniqlo"),
    GAP("Gap"),
    TOMMY_HILFIGER("Tommy Hilfiger"),
    CALVIN_KLEIN("Calvin Klein"),
    LACOSTE("Lacoste"),
    RALPH_LAUREN("Ralph Lauren"),
    LEVI_S("Levi's"),
    DIESEL("Diesel"),
    ARMANI("Armani"),
    GUCCI("Gucci"),
    PRADA("Prada"),
    LOUIS_VUITTON("Louis Vuitton"),
    CHANEL("Chanel"),
    HERMES("Hermès"),
    OTHER("Other");

    private final String label;

    ClothingBrand(String label) {
        this.label = label;
    }
}
