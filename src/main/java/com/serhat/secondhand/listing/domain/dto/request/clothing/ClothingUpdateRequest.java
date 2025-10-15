package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public record ClothingUpdateRequest(
    Optional<@Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters") String> title,
    Optional<@Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters") String> description,
    Optional<@Positive(message = "Price must be positive") BigDecimal> price,
    Optional<Currency> currency,
    Optional<String> city,
    Optional<String> district,
    Optional<ClothingBrand> brand,
    Optional<ClothingType> clothingType,
    Optional<Color> color,
    Optional<LocalDate> purchaseDate,
    Optional<ClothingCondition> condition,
    Optional<ClothingGender> clothingGender,
    Optional<ClothingCategory> clothingCategory,
    Optional<String> imageUrl
) {}
