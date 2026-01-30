package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public record ClothingUpdateRequest(
    Optional<@Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters") String> title,
    Optional<@Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters") String> description,
    Optional<@Positive(message = "Price must be positive") BigDecimal> price,
    Optional<Currency> currency,
    Optional<Integer> quantity,
    Optional<String> city,
    Optional<String> district,
    Optional<UUID> brandId,
    Optional<UUID> clothingTypeId,
    Optional<Color> color,
    Optional<Integer> purchaseYear,
    Optional<ClothingCondition> condition,
    Optional<ClothingSize> size,
    Optional<Integer> shoeSizeEu,
    Optional<String> material,
    Optional<ClothingGender> clothingGender,
    Optional<ClothingCategory> clothingCategory,
    Optional<String> imageUrl
) {}
