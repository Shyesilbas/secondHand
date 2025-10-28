package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import lombok.Getter;

@Getter
public enum Processor {
    INTEL("Intel"),
    AMD("AMD"),
    APPLE_SILICON("Apple Silicon"),
    QUALCOMM("Qualcomm"),
    MEDIATEK("MediaTek"),
    OTHER("Other");

    private final String label;

    Processor(String label) {
        this.label = label;
    }
}


