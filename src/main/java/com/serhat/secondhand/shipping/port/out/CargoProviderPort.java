package com.serhat.secondhand.shipping.port.out;

import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentRequest;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentResponse;
import com.serhat.secondhand.shipping.port.out.dto.CargoTrackingStatus;

public interface CargoProviderPort {
    /**
     * Determines if this provider implementation handles the given providerName.
     * @param providerName The name of the cargo provider (e.g. "JetKargo")
     * @return true if it supports it
     */
    boolean supports(String providerName);

    /**
     * Creates a new shipment with the cargo provider.
     * @param request Contains all necessary details like sender and receiver info.
     * @return Response containing tracking number, label URL etc.
     */
    CargoShipmentResponse createShipment(CargoShipmentRequest request);

    /**
     * Queries the external cargo provider for the latest status.
     * @param trackingNumber The tracking number of the shipment.
     * @return The latest status.
     */
    CargoTrackingStatus getTrackingStatus(String trackingNumber);

    /**
     * Cancels an existing shipment.
     * @param trackingNumber The tracking number of the shipment.
     */
    void cancelShipment(String trackingNumber);
}
