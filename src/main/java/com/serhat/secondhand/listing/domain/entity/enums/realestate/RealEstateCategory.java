package com.serhat.secondhand.listing.domain.entity.enums.realestate;

/**
 * Category of a real estate property type, set per type in {@code data/realestate/realestate.json}
 * ({@code real_estate_types.category}). It also scopes the type's attribute definitions
 * ({@code data/attributes/realestate.json}).
 */
public enum RealEstateCategory {
    RESIDENTIAL,
    LAND,
    COMMERCIAL,
    OTHER
}
