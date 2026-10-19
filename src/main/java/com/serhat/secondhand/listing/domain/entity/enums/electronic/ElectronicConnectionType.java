package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum ElectronicConnectionType {
    WIRED("Kablolu"),
    BLUETOOTH("Bluetooth"),
    HDMI_USB("HDMI/USB"),
    BOTH("Her İkisi");

    private final String label;

    ElectronicConnectionType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ElectronicConnectionType fromLabel(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        return Arrays.stream(values())
                .filter(e -> e.label.equalsIgnoreCase(v) || e.name().equals(v))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown ElectronicConnectionType: " + value));
    }
}

