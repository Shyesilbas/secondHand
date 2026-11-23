package com.serhat.secondhand.listing.domain.entity.enums.base;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;

@Getter
@JsonTypeInfo(use = JsonTypeInfo.Id.NONE)
public enum ListingType {
    VEHICLE("Vasıta"),
    ELECTRONICS("Elektronik"), 
    REAL_ESTATE("Emlak"),
    CLOTHING("Giyim"),
    BOOKS("Kitap"),
    SPORTS("Spor"),
    OTHER("Diğer");

    private final String label;

    ListingType(String label) {
        this.label = label;
    }

    /** Vehicle and real estate listings pay a creation fee; every other type pays commission on the sale instead. */
    public boolean chargesCreationFee() {
        return this == VEHICLE || this == REAL_ESTATE;
    }

    public static java.util.List<ListingType> creationFeeTypes() {
        return java.util.Arrays.stream(values()).filter(ListingType::chargesCreationFee).toList();
    }
}