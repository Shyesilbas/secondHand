package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
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
    private final ElectronicModelVariantRepository variantRepository;

    public Result<ElectronicResolution> resolve(UUID typeId, UUID brandId, UUID modelId, UUID variantId) {
        var type = typeId == null ? null : typeRepository.findById(typeId).orElse(null);
        if (type == null) return Result.error("Electronic type not found", "ELECTRONIC_TYPE_NOT_FOUND");
        var brand = brandId == null ? null : brandRepository.findById(brandId).orElse(null);
        if (brand == null) return Result.error("Electronic brand not found", "ELECTRONIC_BRAND_NOT_FOUND");
        var model = modelId == null ? null : modelRepository.findById(modelId).orElse(null);
        if (model == null) return Result.error("Electronic model not found", "ELECTRONIC_MODEL_NOT_FOUND");
        ElectronicModelVariant variant = null;
        if (variantId != null) {
            variant = variantRepository.findById(variantId).orElse(null);
            if (variant == null) return Result.error("Electronic variant not found", "ELECTRONIC_VARIANT_NOT_FOUND");
        }
        return Result.success(new ElectronicResolution(type, brand, model, variant));
    }

    /**
     * Applies the ids an update sends: a missing field keeps the current value; {@code variantId} sent as null
     * clears the variant.
     */
    public Result<Void> apply(ElectronicListing listing, Optional<UUID> typeId, Optional<UUID> brandId,
                              Optional<UUID> modelId, Optional<UUID> variantId) {
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
        if (variantId != null) {
            if (variantId.isEmpty()) {
                listing.setVariant(null);
            } else {
                var variant = variantRepository.findById(variantId.get()).orElse(null);
                if (variant == null) {
                    return Result.error("Electronic variant not found", "ELECTRONIC_VARIANT_NOT_FOUND");
                }
                listing.setVariant(variant);
            }
        }
        return Result.success();
    }
}
