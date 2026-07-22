package com.serhat.secondhand.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderShipRequest {
    @NotBlank(message = "Provider name is required")
    private String providerName;
}
