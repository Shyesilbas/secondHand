package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum ElectronicCondition {
    NEW("Sıfır"),
    LIKE_NEW("Sıfır Gibi"),
    VERY_GOOD("Çok İyi"),
    GOOD("İyi"),
    FAIR("Orta"),
    DAMAGED("Hasarlı"),
    FOR_PARTS("Yedek Parça");

    private final String label;

    ElectronicCondition(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ElectronicCondition fromLabel(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        return Arrays.stream(values())
                .filter(e -> e.label.equalsIgnoreCase(v) || e.name().equalsIgnoreCase(v))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown ElectronicCondition: " + value));
    }
}
