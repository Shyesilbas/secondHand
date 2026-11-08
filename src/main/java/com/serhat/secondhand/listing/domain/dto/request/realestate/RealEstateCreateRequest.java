package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Which fields apply depends on the property type's rules (realEstateTypes[].fieldRules); hidden ones are cleared.
 * Room count and floor number are derived from {@code roomConfigKey} and {@code floorKey}; coordinates are set by
 * the server from the neighborhood.
 */
public record RealEstateCreateRequest(
        @NotNull @Valid BaseListingCreateRequest base,
        @NotNull UUID adTypeId,
        @NotNull UUID realEstateTypeId,
        UUID heatingTypeId,
        @NotNull UUID ownerTypeId,
        Integer grossAreaM2,
        Integer netAreaM2,
        String roomConfigKey,
        Integer bathroomCount,
        String floorKey,
        Integer totalFloors,
        Integer buildingAge,
        String buildingCondition,
        boolean furnished,
        boolean hasBalcony,
        boolean hasElevator,
        boolean hasParking,
        BigDecimal monthlyFee,
        boolean inSite,
        String siteName,
        Integer gardenAreaM2,
        Integer landShareM2,
        boolean hasPool,
        String zoningStatusKey,
        String parcelNo,
        String blockNo,
        String sheetNo,
        BigDecimal floorAreaRatio,
        BigDecimal heightLimit,
        BigDecimal roadFrontage,
        String infrastructureStatusKey,
        boolean electricityAvailable,
        boolean roadAccess,
        boolean exchangeable,
        Map<String, Object> attributes
) {}
