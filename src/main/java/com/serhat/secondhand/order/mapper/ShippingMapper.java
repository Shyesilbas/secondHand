package com.serhat.secondhand.order.mapper;

import com.serhat.secondhand.order.dto.ShippingDto;
import com.serhat.secondhand.order.entity.Shipping;
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
                .inTransitAt(shipping.getInTransitAt())
                .deliveredAt(shipping.getDeliveredAt())
                .createdAt(shipping.getCreatedAt())
                .updatedAt(shipping.getUpdatedAt())
                .build();
    }
}

