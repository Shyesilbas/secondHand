package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RealEstateCreateRequest(
        @NotNull @Valid BaseListingCreateRequest base,
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
        String zoningStatus
) {}
