package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class CommercialVehicleValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (!isCommercial(listing)) {
            return Result.success();
        }

        if (listing.getMileage() == null || listing.getMileage() < 0) {
            return Result.error("Mileage is required for commercial vehicle listings", "COMMERCIAL_MILEAGE_REQUIRED");
        }
        if (listing.getFuelType() == null) {
            return Result.error("Fuel type is required for commercial vehicle listings", "COMMERCIAL_FUEL_TYPE_REQUIRED");
        }
        if (listing.getGearbox() == null) {
            return Result.error("Gear type is required for commercial vehicle listings", "COMMERCIAL_GEAR_TYPE_REQUIRED");
        }
        if (listing.getBodyType() == null) {
            return Result.error("Body type is required for commercial vehicle listings", "COMMERCIAL_BODY_TYPE_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (isCommercial(listing)) {
            if (listing.getWheels() != null && listing.getWheels() <= 0) {
                listing.setWheels(null);
            }
        }
    }

    private boolean isCommercial(VehicleListing listing) {
        if (listing == null) {
            return false;
        }
        VehicleType type = listing.getVehicleType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "COMMERCIAL".equalsIgnoreCase(type.getName().trim());
    }
}
