package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.springframework.stereotype.Component;

@Component
public class VehicleHierarchyValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (listing.getVehicleType() == null || listing.getBrand() == null || listing.getModel() == null) {
            return Result.success();
        }

        var modelBrandId = listing.getModel().getBrand() != null ? listing.getModel().getBrand().getId() : null;
        var brandId = listing.getBrand().getId();
        if (modelBrandId == null || !modelBrandId.equals(brandId)) {
            return Result.error("Vehicle model does not belong to the selected brand", "MODEL_BRAND_MISMATCH");
        }

        var modelTypeId = listing.getModel().getType() != null ? listing.getModel().getType().getId() : null;
        var typeId = listing.getVehicleType().getId();
        if (modelTypeId == null || !modelTypeId.equals(typeId)) {
            return Result.error("Vehicle model does not belong to the selected type", "MODEL_TYPE_MISMATCH");
        }

        if (listing.getGeneration() != null) {
            var generationModelId = listing.getGeneration().getModel() != null
                    ? listing.getGeneration().getModel().getId()
                    : null;
            var modelId = listing.getModel().getId();
            if (generationModelId == null || !generationModelId.equals(modelId)) {
                return Result.error("Vehicle generation does not belong to the selected model", "GENERATION_MODEL_MISMATCH");
            }
        }

        if (listing.getEngine() != null) {
            if (listing.getGeneration() == null) {
                return Result.error("Vehicle generation is required when engine is selected", "ENGINE_REQUIRES_GENERATION");
            }
            var engineGenerationId = listing.getEngine().getGeneration() != null
                    ? listing.getEngine().getGeneration().getId()
                    : null;
            var generationId = listing.getGeneration().getId();
            if (engineGenerationId == null || !engineGenerationId.equals(generationId)) {
                return Result.error("Vehicle engine does not belong to the selected generation", "ENGINE_GENERATION_MISMATCH");
            }
        }

        if (listing.getTrim() != null) {
            if (listing.getGeneration() == null) {
                return Result.error("Vehicle generation is required when trim is selected", "TRIM_REQUIRES_GENERATION");
            }
            var trimGenerationId = listing.getTrim().getGeneration() != null
                    ? listing.getTrim().getGeneration().getId()
                    : null;
            var generationId = listing.getGeneration().getId();
            if (trimGenerationId == null || !trimGenerationId.equals(generationId)) {
                return Result.error("Vehicle trim does not belong to the selected generation", "TRIM_GENERATION_MISMATCH");
            }
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
    }
}
