package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public record RealEstateUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<String> city,
        Optional<String> district,
        Optional<UUID> adTypeId,
        Optional<UUID> realEstateTypeId,
        Optional<UUID> heatingTypeId,
        Optional<UUID> ownerTypeId,
        Optional<Integer> squareMeters,
        Optional<Integer> roomCount,
        Optional<Integer>  bathroomCount,
        Optional<Integer>   floor,
        Optional<Integer>   buildingAge,
        Optional<Boolean> furnished,
        Optional<String> imageUrl
) {
}
