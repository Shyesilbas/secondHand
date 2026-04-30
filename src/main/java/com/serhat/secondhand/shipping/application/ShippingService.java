package com.serhat.secondhand.shipping.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.shipping.entity.enums.Carrier;

import java.util.Optional;

public interface ShippingService {
    
    /**
     * Updates shipping status to IN_TRANSIT and sets tracking details.
     */
    Result<ShippingDto> startShipping(Long shippingId, Carrier carrier, String trackingNumber);
    
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
