package com.serhat.secondhand.shipping.adapter.out.cargo;

import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.shipping.port.out.CargoProviderPort;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentRequest;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentResponse;
import com.serhat.secondhand.shipping.port.out.dto.CargoTrackingStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
public class JetKargoAdapter implements CargoProviderPort {

    private static final String PROVIDER_NAME = "JetKargo";

    @Override
    public boolean supports(String providerName) {
        return PROVIDER_NAME.equalsIgnoreCase(providerName);
    }

    @Override
    public CargoShipmentResponse createShipment(CargoShipmentRequest request) {
        log.info("Creating mock shipment for order {} via {}", request.getOrderId(), PROVIDER_NAME);
        
        String mockShipmentId = "JET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String mockTrackingNumber = "1Z" + System.currentTimeMillis();
        String mockLabelUrl = "https://mock.jetkargo.com/labels/" + mockShipmentId + ".pdf";
        String mockTrackingUrl = "https://mock.jetkargo.com/track/" + mockTrackingNumber;

        return CargoShipmentResponse.builder()
                .providerName(PROVIDER_NAME)
                .providerShipmentId(mockShipmentId)
                .trackingNumber(mockTrackingNumber)
                .trackingUrl(mockTrackingUrl)
                .labelUrl(mockLabelUrl)
                .estimatedShippingCost(BigDecimal.valueOf(49.90))
                .build();
    }

    @Override
    public CargoTrackingStatus getTrackingStatus(String trackingNumber) {
        log.info("Getting tracking status for {} via {}", trackingNumber, PROVIDER_NAME);
        return CargoTrackingStatus.builder()
                .status(ShippingStatus.IN_TRANSIT)
                .description("Yolda")
                .build();
    }

    @Override
    public void cancelShipment(String trackingNumber) {
        log.info("Cancelling shipment {} via {}", trackingNumber, PROVIDER_NAME);
    }
}
