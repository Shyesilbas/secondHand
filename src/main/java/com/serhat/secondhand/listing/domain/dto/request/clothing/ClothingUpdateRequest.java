package com.serhat.secondhand.listing.domain.dto.request.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.util.Map;
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
    Optional<ClothingAudience> audience,
    Optional<String> sizeSystem,
    Optional<String> sizeKey,
    Optional<ClothingFit> fit,
    Optional<ClothingPattern> pattern,
    Optional<FabricType> fabricType,
    Optional<Map<String, Object>> attributes
) {}
