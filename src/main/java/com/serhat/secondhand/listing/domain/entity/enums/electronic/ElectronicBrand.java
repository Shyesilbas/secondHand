package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import lombok.Getter;

@Getter
public enum ElectronicBrand {
    APPLE("Apple"),
    SAMSUNG("Samsung"),
    MICROSOFT("Microsoft"),
    GOOGLE("Google"),
    SONY("Sony"),
    LG("LG"),
    ASUS("ASUS"),
    XIAOMI("Xiaomi"),
    HUAWEI("Huawei"),
    FUJITSU("Fujitsu"),
    OKI("OKI"),
    BENQ("BenQ"),
    KODAK("Kodak"),
    NIKON("Nikon"),
    PHILLIPS("Phillips");

    private final String label;

    ElectronicBrand(String label) {
        this.label = label;
    }
}
