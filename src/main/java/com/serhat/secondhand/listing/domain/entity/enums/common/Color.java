package com.serhat.secondhand.listing.domain.entity.enums.common;

import lombok.Getter;

@Getter
public enum Color {
    WHITE("White"),
    BLACK("Black"),
    SILVER("Silver"),
    GRAY("Gray"),
    NARDO_GRAY("Nardo Gray"),
    GUNMETAL("Metal Gray"),
    RED("Red"),
    ROSSO_CORSA("Rosso Corsa"),
    DEEP_BLACK("Deep Black"),
    PEARL_WHITE("Pearl White"),
    METALLIC_GRAY("Metallic Gray"),
    CANDY_RED("Candy Red"),
    FOREST_GREEN("Forest Green"),
    SUNSET_ORANGE("Sunset Orange"),
    ROYAL_PURPLE("Royal Purple"),
    CHAMPAGNE_GOLD("Champagne Gold"),
    BLUE("Blue"),
    MIDNIGHT_BLUE("Midnight Blue"),
    ATLANTIC_BLUE("Atlantic Blue"),
    BRITISH_RACING_GREEN("British Racing Green"),
    GREEN("Green"),
    YELLOW("Yellow"),
    SUNBURST_YELLOW("Sunset Yellow"),
    ORANGE("Orange"),
    LAVA_ORANGE("Lava Orange"),
    BROWN("Brown"),
    BEIGE("Beige"),
    PURPLE_AMETHYST("Purple Amethyst"),
    MATTE_BLACK("Matte Black");

    private final String label;

    Color(String label) {
        this.label = label;
    }
}
