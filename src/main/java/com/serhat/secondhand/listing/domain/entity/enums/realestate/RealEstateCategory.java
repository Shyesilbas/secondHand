package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import java.util.Locale;
import java.util.Set;

/**
 * Domain categories for real estate property types:
 * RESIDENTIAL (houses, apartments, villas, prefabricated homes),
 * LAND (residential/commercial zoned land, agricultural land, farms, orchards),
 * COMMERCIAL (offices, shops, stores, warehouses, factory/industrial, buildings),
 * OTHER (miscellaneous real estate properties).
 */
public enum RealEstateCategory {
    RESIDENTIAL,
    LAND,
    COMMERCIAL,
    OTHER;

    private static final Set<String> LAND_TYPES = Set.of(
            "LAND", "COMMERCIAL_LAND", "FARM", "VINEYARD", "OLIVE_GROVE"
    );

    private static final Set<String> RESIDENTIAL_TYPES = Set.of(
            "APARTMENT", "RESIDENCE", "STUDIO", "DUPLEX", "PENTHOUSE",
            "HOUSE", "VILLA", "TOWNHOUSE", "SUMMER_HOUSE", "CHALET",
            "MANSION", "PREFABRICATED"
    );

    private static final Set<String> COMMERCIAL_TYPES = Set.of(
            "OFFICE", "COMMERCIAL", "SHOP", "WAREHOUSE", "FACTORY",
            "INDUSTRIAL", "HOTEL", "PARKING", "BUILDING"
    );

    public static RealEstateCategory fromTypeName(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            return OTHER;
        }
        String upper = typeName.trim().toUpperCase(Locale.ROOT);
        if (LAND_TYPES.contains(upper)) {
            return LAND;
        }
        if (RESIDENTIAL_TYPES.contains(upper)) {
            return RESIDENTIAL;
        }
        if (COMMERCIAL_TYPES.contains(upper)) {
            return COMMERCIAL;
        }
        return OTHER;
    }

    public boolean isLand() {
        return this == LAND;
    }

    public boolean isResidential() {
        return this == RESIDENTIAL;
    }

    public boolean isCommercial() {
        return this == COMMERCIAL;
    }

    public boolean isOther() {
        return this == OTHER;
    }
}
