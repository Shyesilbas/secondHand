package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClothingListingResolver {
    private final ClothingBrandRepository clothingBrandRepository;
    private final ClothingTypeRepository clothingTypeRepository;

    public Result<ClothingResolution> resolve(UUID brandId, UUID clothingTypeId) {
        var brand = clothingBrandRepository.findById(brandId).orElse(null);
        if (brand == null) return Result.error("Clothing brand not found", "CLOTHING_BRAND_NOT_FOUND");

        var type = clothingTypeRepository.findById(clothingTypeId).orElse(null);
        if (type == null) return Result.error("Clothing type not found", "CLOTHING_TYPE_NOT_FOUND");

        return Result.success(new ClothingResolution(brand, type));
    }

    public Result<Void> apply(ClothingListing listing, Optional<UUID> brandId, Optional<UUID> clothingTypeId) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (brandId != null && brandId.isPresent()) {
            var brand = clothingBrandRepository.findById(brandId.get()).orElse(null);
            if (brand == null) return Result.error("Clothing brand not found", "CLOTHING_BRAND_NOT_FOUND");
            listing.setBrand(brand);
        }

        if (clothingTypeId != null && clothingTypeId.isPresent()) {
            var type = clothingTypeRepository.findById(clothingTypeId.get()).orElse(null);
            if (type == null) return Result.error("Clothing type not found", "CLOTHING_TYPE_NOT_FOUND");
            listing.setClothingType(type);
        }

        return Result.success();
    }
}

