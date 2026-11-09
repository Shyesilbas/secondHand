package com.serhat.secondhand.listing.domain.entity.enums.clothing;

import lombok.Getter;

/** Price segment of a clothing brand (data/clothing/brands.json); drives generated prices. */
@Getter
public enum BrandSegment {
    BUDGET("Uygun fiyatlı"),
    MID("Orta segment"),
    PREMIUM("Premium"),
    LUXURY("Lüks");

    private final String label;

    BrandSegment(String label) {
        this.label = label;
    }
}
