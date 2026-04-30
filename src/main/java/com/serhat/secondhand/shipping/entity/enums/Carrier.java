package com.serhat.secondhand.shipping.entity.enums;

import lombok.Getter;

@Getter
public enum Carrier {
    ARAS("Aras Kargo", "https://kargo.aras.com.tr/tracking/"),
    YURTICI("Yurtiçi Kargo", "https://www.yurticikargo.com/tracking/"),
    MNG("MNG Kargo", "https://www.mngkargo.com.tr/tracking/"),
    UPS("UPS Kargo", "https://www.ups.com/track?tracknum="),
    OTHER("Diğer", "");

    private final String name;
    private final String trackingUrlBase;

    Carrier(String name, String trackingUrlBase) {
        this.name = name;
        this.trackingUrlBase = trackingUrlBase;
    }
}
