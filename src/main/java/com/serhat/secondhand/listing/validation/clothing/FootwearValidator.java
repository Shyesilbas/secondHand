package com.serhat.secondhand.listing.validation.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.springframework.stereotype.Component;

@Component
public class FootwearValidator implements ClothingSpecValidator {

    @Override
    public Result<Void> validate(ClothingListing listing) {
        if (!isFootwear(listing)) {
            return Result.success();
        }

        Integer shoeSizeEu = listing.getShoeSizeEu();
        if (shoeSizeEu == null || shoeSizeEu < 20 || shoeSizeEu > 55) {
            return Result.error("Shoe size (EU) is required for footwear listings", "CLOTHING_SHOE_SIZE_REQUIRED");
        }

        String material = listing.getMaterial();
        if (material != null && !material.isBlank() && material.trim().length() > 120) {
            return Result.error("Material is too long", "CLOTHING_MATERIAL_TOO_LONG");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ClothingListing listing) {
        if (isFootwear(listing)) {
            listing.setSize(null);
        }
    }

    private boolean isFootwear(ClothingListing listing) {
        if (listing == null) {
            return false;
        }
        ClothingType type = listing.getClothingType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String name = type.getName();
        return "SHOES".equalsIgnoreCase(name)
                || "SNEAKERS".equalsIgnoreCase(name)
                || "BOOTS".equalsIgnoreCase(name)
                || "SANDALS".equalsIgnoreCase(name)
                || "HEELS".equalsIgnoreCase(name)
                || "FLATS".equalsIgnoreCase(name);
    }
}

