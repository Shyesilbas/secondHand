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
}