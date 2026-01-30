package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.util.Optional;
import java.util.UUID;

public record ClothingUpdateRequest(
    BaseListingUpdateRequest base,
    Optional<Integer> quantity,
    Optional<UUID> brandId,
    Optional<UUID> clothingTypeId,
    Optional<Color> color,
    Optional<Integer> purchaseYear,
    Optional<ClothingCondition> condition,
    Optional<ClothingSize> size,
    Optional<Integer> shoeSizeEu,
    Optional<String> material,
    Optional<ClothingGender> clothingGender,
    Optional<ClothingCategory> clothingCategory
) {}
