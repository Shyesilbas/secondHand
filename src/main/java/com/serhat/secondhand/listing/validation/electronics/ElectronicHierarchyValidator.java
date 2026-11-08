package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import org.springframework.stereotype.Component;

@Component
public class ElectronicHierarchyValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (listing.getElectronicType() == null || listing.getElectronicBrand() == null || listing.getModel() == null) {
            return Result.success();
        }

        if (listing.getElectronicBrand() != null && listing.getModel() != null
                && listing.getElectronicBrand().getId() != null
                && listing.getModel().getBrand() != null
                && listing.getModel().getBrand().getId() != null
                && !listing.getElectronicBrand().getId().equals(listing.getModel().getBrand().getId())) {
            return Result.error("Electronic model does not match brand", "ELECTRONIC_MODEL_BRAND_MISMATCH");
        }

        if (listing.getElectronicType() != null && listing.getModel() != null
                && listing.getElectronicType().getId() != null
                && listing.getModel().getType() != null
                && listing.getModel().getType().getId() != null
                && !listing.getElectronicType().getId().equals(listing.getModel().getType().getId())) {
            return Result.error("Electronic model does not match type", "ELECTRONIC_MODEL_TYPE_MISMATCH");
        }

        if (listing.getVariant() != null && listing.getVariant().getModel() != null
                && !listing.getModel().getId().equals(listing.getVariant().getModel().getId())) {
            return Result.error("Electronic variant does not belong to the model", "ELECTRONIC_VARIANT_MODEL_MISMATCH");
        }

        if (listing.getColorName() != null) {
            boolean known = listing.getModel().getColors() != null && listing.getModel().getColors().stream()
                    .anyMatch(c -> listing.getColorName().equals(c.getName()));
            if (!known) {
                return Result.error("Color '" + listing.getColorName() + "' is not a color of this model",
                        "ELECTRONIC_COLOR_NOT_IN_MODEL");
            }
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
    }
}

