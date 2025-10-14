package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

@Getter
public enum ClothingType {
    TSHIRT("T-Shirt"),
    SHIRT("Shirt"),
    PANTS("Pants"),
    JEANS("Jeans"),
    SHORTS("Shorts"),
    DRESS("Dress"),
    SKIRT("Skirt"),
    JACKET("Jacket"),
    COAT("Coat"),
    SWEATER("Sweater"),
    HOODIE("Hoodie"),
    SWEATSHIRT("Sweatshirt"),
    SUIT("Suit"),
    BLAZER("Blazer"),
    VEST("Vest"),
    UNDERWEAR("Underwear"),
    SOCKS("Socks"),
    HAT("Hat"),
    CAP("Cap"),
    SCARF("Scarf"),
    GLOVES("Gloves"),
    BELT("Belt"),
    TIE("Tie"),
    BAG("Bag"),
    SHOES("Shoes"),
    SNEAKERS("Sneakers"),
    BOOTS("Boots"),
    SANDALS("Sandals"),
    HEELS("Heels"),
    FLATS("Flats"),
    OTHER("Other");

    private final String label;

    ClothingType(String label) {
        this.label = label;
    }
}
