package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

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

    @NotNull(message = "Purchase year is required")
    @Min(value = 1900, message = "Purchase year must be valid")
    @Max(value = 2100, message = "Purchase year must be valid")
    Integer purchaseYear,

    @NotNull(message = "Condition is required")
    ClothingCondition condition,

    ClothingSize size,

    Integer shoeSizeEu,

    String material,

    @NotNull(message = "Clothing gender is required")
    ClothingGender clothingGender,

    @NotNull(message = "Clothing category is required")
    ClothingCategory clothingCategory
) {}
