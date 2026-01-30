package com.serhat.secondhand.listing.validation.electronic;

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

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
    }
}

