package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.shipping.entity.enums.Carrier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderShipRequest {
    
    @NotNull(message = "Carrier is required")
    private Carrier carrier;
    
    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;
}
