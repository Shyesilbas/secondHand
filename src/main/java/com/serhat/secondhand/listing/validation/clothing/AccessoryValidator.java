package com.serhat.secondhand.listing.validation.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.springframework.stereotype.Component;

@Component
public class AccessoryValidator implements ClothingSpecValidator {

    @Override
    public Result<Void> validate(ClothingListing listing) {
        if (!isAccessory(listing)) {
            return Result.success();
        }

        String material = listing.getMaterial();
        if (material != null && !material.isBlank() && material.trim().length() > 120) {
            return Result.error("Material is too long", "CLOTHING_MATERIAL_TOO_LONG");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ClothingListing listing) {
        if (isAccessory(listing)) {
            listing.setSize(null);
            listing.setShoeSizeEu(null);
        }
    }

    private boolean isAccessory(ClothingListing listing) {
        if (listing == null) {
            return false;
        }
        ClothingType type = listing.getClothingType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String name = type.getName();
        return "HAT".equalsIgnoreCase(name)
                || "CAP".equalsIgnoreCase(name)
                || "SCARF".equalsIgnoreCase(name)
                || "GLOVES".equalsIgnoreCase(name)
                || "BELT".equalsIgnoreCase(name)
                || "TIE".equalsIgnoreCase(name)
                || "BAG".equalsIgnoreCase(name);
    }
}

