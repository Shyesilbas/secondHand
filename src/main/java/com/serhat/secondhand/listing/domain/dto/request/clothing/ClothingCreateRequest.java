package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

/** Size: a system the type allows for the audience plus a value key (data/common/sizes.json); one-size types may omit it. */
public record ClothingCreateRequest(
    @NotNull(message = "Listing base fields are required")
    @Valid BaseListingCreateRequest base,

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity,

    @NotNull(message = "Brand is required")
    UUID brandId,

    @NotNull(message = "Clothing type is required")
    UUID clothingTypeId,

    @NotNull(message = "Color is required")
    Color color,

    Integer purchaseYear,

    @NotNull(message = "Condition is required")
    ClothingCondition condition,

    @NotNull(message = "Audience is required")
    ClothingAudience audience,

    @Size(max = 30) String sizeSystem,
    @Size(max = 30) String sizeKey,

    ClothingFit fit,
    ClothingPattern pattern,
    FabricType fabricType,

    Map<String, Object> attributes
) {}
