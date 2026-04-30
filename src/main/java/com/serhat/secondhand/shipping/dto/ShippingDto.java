package com.serhat.secondhand.shipping.dto;

import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingDto {

    private Long id;
    private ShippingStatus status;
    private Carrier carrier;
    private String carrierName;
    private String trackingNumber;
    private String trackingUrl;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime inTransitAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
