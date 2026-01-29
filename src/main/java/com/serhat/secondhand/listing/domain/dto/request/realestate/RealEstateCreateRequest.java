package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;
import java.util.UUID;

public record RealEstateCreateRequest(
        String title,
        String description,
        BigDecimal price,
        Currency currency,
        String city,
        String district,
        UUID adTypeId,
        UUID realEstateTypeId,
        UUID heatingTypeId,
        UUID ownerTypeId,
        Integer squareMeters,
        Integer roomCount,
        Integer bathroomCount,
        Integer floor,
        Integer buildingAge,
        boolean furnished,
        String imageUrl
) {
}
