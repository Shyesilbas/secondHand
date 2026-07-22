package com.serhat.secondhand.shipping.port.out.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CargoShipmentRequest {
    private final UUID orderId;
    private final String senderName;
    private final String senderAddress;
    private final String senderPhone;
    private final String receiverName;
    private final String receiverAddress;
    private final String receiverPhone;
}
