package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.util.Optional;
import java.util.UUID;

public record RealEstateUpdateRequest(
        BaseListingUpdateRequest base,
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
        Optional<String> zoningStatus
) {}
