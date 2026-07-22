package com.serhat.secondhand.shipping.port.out.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CargoShipmentResponse {
    private final String providerName;
    private final String providerShipmentId;
    private final String trackingNumber;
    private final String trackingUrl;
    private final String labelUrl;
    private final BigDecimal estimatedShippingCost;
}
