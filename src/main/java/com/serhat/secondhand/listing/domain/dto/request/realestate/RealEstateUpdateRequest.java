package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Absent fields stay as they are; text and number fields sent as null clear the value. */
public record RealEstateUpdateRequest(
        BaseListingUpdateRequest base,
        Optional<UUID> adTypeId,
        Optional<UUID> realEstateTypeId,
        Optional<UUID> heatingTypeId,
        Optional<UUID> ownerTypeId,
        Optional<Integer> grossAreaM2,
        Optional<Integer> netAreaM2,
        Optional<String> roomConfigKey,
        Optional<Integer> bathroomCount,
        Optional<String> floorKey,
        Optional<Integer> totalFloors,
        Optional<Integer> buildingAge,
        Optional<String> buildingCondition,
        Optional<Boolean> furnished,
        Optional<Boolean> hasBalcony,
        Optional<Boolean> hasElevator,
        Optional<Boolean> hasParking,
        Optional<BigDecimal> monthlyFee,
        Optional<Boolean> inSite,
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
        Optional<Boolean> electricityAvailable,
        Optional<Boolean> roadAccess,
        Optional<Boolean> exchangeable,
        Optional<Map<String, Object>> attributes
) {}
