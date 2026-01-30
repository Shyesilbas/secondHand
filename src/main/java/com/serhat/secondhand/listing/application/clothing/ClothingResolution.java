package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;

public record ClothingResolution(
        ClothingBrand brand,
        ClothingType type
) {}

