package com.serhat.secondhand.listing.domain.dto.request.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;

public record ElectronicCreateRequest (
        String title,
        String description,
        BigDecimal price,
        Currency currency,
        String city,
        String district,
        ElectronicType electronicType,
        ElectronicBrand electronicBrand,
        String model,
        String origin,
        boolean warrantyProof,
        int year,
        Color color
        // todo createRequest should be extended by ListingRequest( not created yet)
){
}
