package com.serhat.secondhand.listing.domain.entity.enums.common;

import lombok.Getter;

@Getter
public enum Color {
    WHITE("Beyaz"),
    BLACK("Siyah"),
    SILVER("Gümüş"),
    GRAY("Gri"),
    NARDO_GRAY("Nardo Gri"),
    GUNMETAL("Metal Gri"),
    RED("Kırmızı"),
    ROSSO_CORSA("Rosso Corsa Kırmızı"),
    DEEP_BLACK("Derin Siyah"),
    PEARL_WHITE("İnci Beyaz"),
    METALLIC_GRAY("Metalik Gri"),
    CANDY_RED("Şeker Kırmızı"),
    FOREST_GREEN("Orman Yeşili"),
    SUNSET_ORANGE("Gün Batımı Turuncu"),
    ROYAL_PURPLE("Kraliyet Moru"),
    CHAMPAGNE_GOLD("Şampanya Altın"),
    BLUE("Mavi"),
    MIDNIGHT_BLUE("Gece Mavisi"),
    ATLANTIC_BLUE("Atlantik Mavisi"),
    BRITISH_RACING_GREEN("Yarış Yeşili"),
    GREEN("Yeşil"),
    YELLOW("Sarı"),
    SUNBURST_YELLOW("Gün Batımı Sarı"),
    ORANGE("Turuncu"),
    LAVA_ORANGE("Lav Turuncu"),
    BROWN("Kahverengi"),
    BEIGE("Bej"),
    PURPLE_AMETHYST("Ametist Moru"),
    MATTE_BLACK("Mat Siyah");

    private final String label;

    Color(String label) {
        this.label = label;
    }
}
