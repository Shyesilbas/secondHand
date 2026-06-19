package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
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
        String zoningStatus,

        // Premium fields
        Integer grossAreaM2,
        Integer netAreaM2,
        String usageStatus,
        String deedStatus,
        String roomConfigKey,
        Integer floorNumber,
        Integer totalFloors,
        boolean hasBalcony,
        boolean hasElevator,
        boolean hasParking,
        BigDecimal monthlyFee,
        boolean isInSite,
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
        String waterSource,
        boolean electricityAvailable,
        boolean roadAccess
) {}
