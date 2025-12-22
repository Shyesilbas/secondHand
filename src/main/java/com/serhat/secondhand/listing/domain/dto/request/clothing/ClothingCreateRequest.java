package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ClothingCreateRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    String title,

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    String description,

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    BigDecimal price,

    @NotNull(message = "Currency is required")
    Currency currency,

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity,

    @NotBlank(message = "City is required")
    String city,

    @NotBlank(message = "District is required")
    String district,

    @NotNull(message = "Brand is required")
    ClothingBrand brand,

    @NotNull(message = "Clothing type is required")
    ClothingType clothingType,

    @NotNull(message = "Color is required")
    Color color,

    @NotNull(message = "Purchase date is required")
    LocalDate purchaseDate,

    @NotNull(message = "Condition is required")
    ClothingCondition condition,

    @NotNull(message = "Clothing gender is required")
    ClothingGender clothingGender,

    @NotNull(message = "Clothing category is required")
    ClothingCategory clothingCategory,

    String imageUrl
) {}
