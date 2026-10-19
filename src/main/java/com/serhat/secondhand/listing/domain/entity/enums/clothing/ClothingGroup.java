package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import java.util.Locale;
import java.util.Set;

/**
 * Categorizes clothing types into three distinct domain groups:
 * APPAREL (requires clothing size: S/M/L/etc.),
 * FOOTWEAR (requires EU shoe size: 20-55),
 * ACCESSORY (no size required).
 */
public enum ClothingGroup {
    APPAREL,
    FOOTWEAR,
    ACCESSORY;

    private static final Set<String> FOOTWEAR_TYPES = Set.of(
            "SHOES", "SNEAKERS", "BOOTS", "SANDALS", "SLIPPERS", "HEELS", "FLATS", "LOAFERS"
    );

    private static final Set<String> ACCESSORY_TYPES = Set.of(
            "BAG", "BACKPACK", "HANDBAG", "CROSSBODY_BAG", "CLUTCH", "SUITCASE",
            "WALLET", "WATCH", "SUNGLASSES", "JEWELRY", "NECKLACE", "BRACELET",
            "EARRINGS", "RING", "BELT", "HAT", "CAP", "BEANIE", "SCARF",
            "GLOVES", "TIE", "BOW_TIE", "OTHER"
    );

    public static ClothingGroup fromTypeName(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            return ACCESSORY;
        }
        String upper = typeName.trim().toUpperCase(Locale.ROOT);
        if (FOOTWEAR_TYPES.contains(upper)) {
            return FOOTWEAR;
        }
        if (ACCESSORY_TYPES.contains(upper)) {
            return ACCESSORY;
        }
        return APPAREL;
    }
}
