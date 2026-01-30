package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

@Component
public class TruckValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (!isType(listing, "TRUCK")) {
            return Result.success();
        }

        if (listing.getFuelType() == null) {
            return Result.error("Fuel type is required for truck listings", "TRUCK_FUEL_TYPE_REQUIRED");
        }
        if (listing.getMileage() == null || listing.getMileage() < 0) {
            return Result.error("Mileage is required for truck listings", "TRUCK_MILEAGE_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (isType(listing, "TRUCK")) {
            if (listing.getWheels() != null && listing.getWheels() <= 0) {
                listing.setWheels(null);
            }
            return;
        }
    }

    private boolean isType(VehicleListing listing, String typeName) {
        if (listing == null) {
            return false;
        }
        VehicleType type = listing.getVehicleType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return typeName.equalsIgnoreCase(type.getName());
    }
}

