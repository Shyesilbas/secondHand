package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.springframework.stereotype.Component;

@Component
public class VehicleRequiredFieldsValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (listing.getVehicleType() == null) {
            return Result.error("Vehicle type is required", "VEHICLE_TYPE_REQUIRED");
        }
        if (listing.getBrand() == null) {
            return Result.error("Vehicle brand is required", "VEHICLE_BRAND_REQUIRED");
        }
        if (listing.getModel() == null) {
            return Result.error("Vehicle model is required", "VEHICLE_MODEL_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
    }
}

