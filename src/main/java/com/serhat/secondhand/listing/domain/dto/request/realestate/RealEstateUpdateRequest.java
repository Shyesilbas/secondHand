package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.math.BigDecimal;
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
        Optional<Integer> bathroomCount,
        Optional<Integer> floor,
        Optional<Integer> buildingAge,
        Optional<Boolean> furnished,
        Optional<String> zoningStatus,

        // Premium fields
        Optional<Integer> grossAreaM2,
        Optional<Integer> netAreaM2,
        Optional<String> usageStatus,
        Optional<String> deedStatus,
        Optional<String> roomConfigKey,
        Optional<String> heatingTypeKey,
        Optional<Integer> floorNumber,
        Optional<Integer> totalFloors,
        Optional<Boolean> hasBalcony,
        Optional<Boolean> hasElevator,
        Optional<Boolean> hasParking,
        Optional<BigDecimal> monthlyFee,
        Optional<Boolean> isInSite,
        Optional<String> siteName,
        Optional<Integer> gardenAreaM2,
        Optional<Integer> landShareM2,
        Optional<Boolean> hasPool,
        Optional<String> zoningStatusKey,
        Optional<String> parcelNo,
        Optional<String> blockNo,
        Optional<String> sheetNo,
        Optional<BigDecimal> floorAreaRatio,
        Optional<BigDecimal> heightLimit,
        Optional<BigDecimal> roadFrontage,
        Optional<String> infrastructureStatusKey,
        Optional<String> waterSource,
        Optional<Boolean> electricityAvailable,
        Optional<Boolean> roadAccess
) {}
