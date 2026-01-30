package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ElectronicListingResolver {
    private final ElectronicTypeRepository typeRepository;
    private final ElectronicBrandRepository brandRepository;
    private final ElectronicModelRepository modelRepository;

    public Result<ElectronicResolution> resolve(UUID typeId, UUID brandId, UUID modelId) {
        var type = typeRepository.findById(typeId).orElse(null);
        if (type == null) return Result.error("Electronic type not found", "ELECTRONIC_TYPE_NOT_FOUND");

        var brand = brandRepository.findById(brandId).orElse(null);
        if (brand == null) return Result.error("Electronic brand not found", "ELECTRONIC_BRAND_NOT_FOUND");

        var model = modelRepository.findById(modelId).orElse(null);
        if (model == null) return Result.error("Electronic model not found", "ELECTRONIC_MODEL_NOT_FOUND");

        return Result.success(new ElectronicResolution(type, brand, model));
    }

    public Result<Void> apply(ElectronicListing listing, Optional<UUID> typeId, Optional<UUID> brandId, Optional<UUID> modelId) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (typeId != null && typeId.isPresent()) {
            var type = typeRepository.findById(typeId.get()).orElse(null);
            if (type == null) {
                return Result.error("Electronic type not found", "ELECTRONIC_TYPE_NOT_FOUND");
            }
            listing.setElectronicType(type);
        }

        if (brandId != null && brandId.isPresent()) {
            var brand = brandRepository.findById(brandId.get()).orElse(null);
            if (brand == null) {
                return Result.error("Electronic brand not found", "ELECTRONIC_BRAND_NOT_FOUND");
            }
            listing.setElectronicBrand(brand);
        }

        if (modelId != null && modelId.isPresent()) {
            var model = modelRepository.findById(modelId.get()).orElse(null);
            if (model == null) {
                return Result.error("Electronic model not found", "ELECTRONIC_MODEL_NOT_FOUND");
            }
            listing.setModel(model);
        }

        return Result.success();
    }
}