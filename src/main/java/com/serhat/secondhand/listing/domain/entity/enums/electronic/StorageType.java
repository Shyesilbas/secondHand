package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import lombok.Getter;

@Getter
public enum StorageType {
    HDD("HDD"),
    SSD("SSD"),
    HYBRID("Hybrid"),
    EMMC("eMMC"),
    NVME("NVMe");

    private final String label;

    StorageType(String label) {
        this.label = label;
    }
}

