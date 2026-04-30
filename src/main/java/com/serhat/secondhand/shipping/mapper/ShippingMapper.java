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
                .carrier(shipping.getCarrier())
                .carrierName(shipping.getCarrier() != null ? shipping.getCarrier().getName() : null)
                .trackingNumber(shipping.getTrackingNumber())
                .trackingUrl(shipping.getTrackingUrl())
                .estimatedDeliveryDate(shipping.getEstimatedDeliveryDate())
                .inTransitAt(shipping.getInTransitAt())
                .deliveredAt(shipping.getDeliveredAt())
                .createdAt(shipping.getCreatedAt())
                .updatedAt(shipping.getUpdatedAt())
                .build();
    }
}
