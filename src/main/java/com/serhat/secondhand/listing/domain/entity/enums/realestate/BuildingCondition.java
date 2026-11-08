package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

/** Condition of the building; sent and stored by name, shown by label. */
@Getter
public enum BuildingCondition {
    BRAND_NEW("Sıfır / yeni"),
    GOOD_CONDITION("İyi durumda"),
    RENOVATED("Yenilenmiş"),
    NEEDS_RENOVATION("Tadilat gerekli"),
    UNDER_CONSTRUCTION("İnşaat halinde");

    private final String label;

    BuildingCondition(String label) {
        this.label = label;
    }

    public static Optional<BuildingCondition> fromName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        String key = name.trim();
        return Arrays.stream(values()).filter(c -> c.name().equals(key)).findFirst();
    }
}
