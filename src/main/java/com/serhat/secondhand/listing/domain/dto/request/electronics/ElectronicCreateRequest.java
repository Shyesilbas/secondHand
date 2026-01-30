package com.serhat.secondhand.listing.domain.dto.request.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ElectronicCreateRequest(
        @NotNull @Valid BaseListingCreateRequest base,
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,
        UUID electronicTypeId,
        UUID electronicBrandId,
        UUID electronicModelId,
        String origin,
        boolean warrantyProof,
        int year,
        Color color,
        Integer ram,
        Integer storage,
        StorageType storageType,
        Processor processor,
        Integer screenSize,
        String gpuModel,
        String operatingSystem,
        Integer batteryHealthPercent,
        Integer batteryCapacityMah,
        Integer cameraMegapixels,
        Boolean supports5g,
        Boolean dualSim,
        Boolean hasNfc,
        ElectronicConnectionType connectionType,
        Boolean wireless,
        Boolean noiseCancelling,
        Boolean hasMicrophone,
        Integer batteryLifeHours
) {}
