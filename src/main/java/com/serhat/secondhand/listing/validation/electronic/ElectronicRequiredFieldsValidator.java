package com.serhat.secondhand.listing.validation.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import org.springframework.stereotype.Component;

@Component
public class ElectronicRequiredFieldsValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (listing.getElectronicType() == null) {
            return Result.error("Electronic type is required", "ELECTRONIC_TYPE_REQUIRED");
        }
        if (listing.getElectronicBrand() == null) {
            return Result.error("Electronic brand is required", "ELECTRONIC_BRAND_REQUIRED");
        }
        if (listing.getModel() == null) {
            return Result.error("Electronic model is required", "ELECTRONIC_MODEL_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
    }
}

