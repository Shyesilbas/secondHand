package com.serhat.secondhand.listing.validation.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.springframework.stereotype.Component;

@Component
public class ApparelValidator implements ClothingSpecValidator {

    @Override
    public Result<Void> validate(ClothingListing listing) {
        if (!isApparel(listing)) {
            return Result.success();
        }

        if (listing.getSize() == null) {
            return Result.error("Size is required for apparel listings", "CLOTHING_SIZE_REQUIRED");
        }

        String material = listing.getMaterial();
        if (material != null && !material.isBlank() && material.trim().length() > 120) {
            return Result.error("Material is too long", "CLOTHING_MATERIAL_TOO_LONG");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ClothingListing listing) {
        if (isApparel(listing)) {
            listing.setShoeSizeEu(null);
        }
    }

    private boolean isApparel(ClothingListing listing) {
        if (listing == null) {
            return false;
        }
        ClothingType type = listing.getClothingType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String name = type.getName();
        return "T_SHIRT".equalsIgnoreCase(name)
                || "SHIRT".equalsIgnoreCase(name)
                || "PANTS".equalsIgnoreCase(name)
                || "JEANS".equalsIgnoreCase(name)
                || "SHORTS".equalsIgnoreCase(name)
                || "DRESS".equalsIgnoreCase(name)
                || "SKIRT".equalsIgnoreCase(name)
                || "JACKET".equalsIgnoreCase(name)
                || "COAT".equalsIgnoreCase(name)
                || "SWEATER".equalsIgnoreCase(name)
                || "HOODIE".equalsIgnoreCase(name)
                || "SWEATSHIRT".equalsIgnoreCase(name)
                || "SUIT".equalsIgnoreCase(name)
                || "BLAZER".equalsIgnoreCase(name)
                || "VEST".equalsIgnoreCase(name)
                || "UNDERWEAR".equalsIgnoreCase(name)
                || "SOCKS".equalsIgnoreCase(name);
    }
}

