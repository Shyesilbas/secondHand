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

        var version = listing.getVehicleVersion();
        if (version != null) {
            if (listing.getGeneration() == null) {
                return Result.error("Vehicle generation is required when version is selected", "VERSION_REQUIRES_GENERATION");
            }
            var versionGenerationId = version.getGeneration() != null ? version.getGeneration().getId() : null;
            if (versionGenerationId == null || !versionGenerationId.equals(listing.getGeneration().getId())) {
                return Result.error("Vehicle version does not belong to the selected generation", "VERSION_GENERATION_MISMATCH");
            }

            Integer year = listing.getYear();
            Integer from = version.effectiveStartYear();
            Integer to = version.effectiveEndYear();
            if (year != null && ((from != null && year < from) || (to != null && year > to))) {
                return Result.error("Model year " + year + " is outside the selected version's years ("
                        + (from != null ? from : "?") + "-" + (to != null ? to : "") + ")", "VEHICLE_YEAR_OUT_OF_VERSION_RANGE");
            }

            if (listing.getTrim() != null && !version.getTrims().isEmpty()) {
                var trimId = listing.getTrim().getId();
                boolean offered = version.getTrims().stream().anyMatch(t -> t.getId().equals(trimId));
                if (!offered) {
                    return Result.error("Vehicle trim is not offered with the selected version", "TRIM_VERSION_MISMATCH");
                }
            }
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
    }
}
