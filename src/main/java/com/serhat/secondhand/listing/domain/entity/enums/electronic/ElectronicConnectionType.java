package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import lombok.Getter;

@Getter
public enum ElectronicConnectionType {
    WIRED("Wired"),
    BLUETOOTH("Bluetooth"),
    BOTH("Both");

    private final String label;

    ElectronicConnectionType(String label) {
        this.label = label;
    }
}

