package com.serhat.secondhand.shipping.mapper;

import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.shipping.entity.Shipping;
import org.springframework.stereotype.Component;

@Component
public class ShippingMapper {

    public ShippingDto toDto(Shipping shipping) {
        if (shipping == null) {
            return null;
        }

        return ShippingDto.builder()
                .id(shipping.getId())
                .status(shipping.getStatus())
                .providerName(shipping.getProviderName())
                .providerShipmentId(shipping.getProviderShipmentId())
                .trackingNumber(shipping.getTrackingNumber())
                .trackingUrl(shipping.getTrackingUrl())
                .labelUrl(shipping.getLabelUrl())
                .shippingCost(shipping.getShippingCost())
                .estimatedDeliveryDate(shipping.getEstimatedDeliveryDate())
                .inTransitAt(shipping.getInTransitAt())
                .deliveredAt(shipping.getDeliveredAt())
                .createdAt(shipping.getCreatedAt())
                .updatedAt(shipping.getUpdatedAt())
                .build();
    }
}
