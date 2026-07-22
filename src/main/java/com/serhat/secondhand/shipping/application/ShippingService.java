package com.serhat.secondhand.shipping.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import java.util.Optional;

public interface ShippingService {
    
    /**
     * Creates a shipment via CargoProviderPort and updates shipping status.
     */
    Result<ShippingDto> createShipmentForOrder(Long shippingId, String providerName);
    
    /**
     * Updates shipping status to DELIVERED.
     */
    Result<ShippingDto> completeShipping(Long shippingId);
    
    /**
     * Cancels the shipping.
     */
    Result<Void> cancelShipping(Long shippingId);
    
    /**
     * Finds shipping by ID.
     */
    Optional<ShippingDto> getById(Long shippingId);
}
