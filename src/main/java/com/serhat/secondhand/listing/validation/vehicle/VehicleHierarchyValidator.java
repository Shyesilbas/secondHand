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

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
    }
}

