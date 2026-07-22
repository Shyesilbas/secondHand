package com.serhat.secondhand.shipping.port.out.dto;

import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CargoTrackingStatus {
    private final ShippingStatus status;
    private final String description;
}
