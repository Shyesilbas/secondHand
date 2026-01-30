package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

@Component
public class MotorcycleValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (!isType(listing, "MOTORCYCLE")) {
            return Result.success();
        }

        if (listing.getEngineCapacity() == null || listing.getEngineCapacity() <= 0) {
            return Result.error("Engine capacity is required for motorcycle listings", "MOTORCYCLE_ENGINE_CAPACITY_REQUIRED");
        }
        if (listing.getFuelType() == null) {
            return Result.error("Fuel type is required for motorcycle listings", "MOTORCYCLE_FUEL_TYPE_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (isType(listing, "MOTORCYCLE")) {
            listing.setDoors(null);
            listing.setSeatCount(null);
            listing.setBodyType(null);
            listing.setDrivetrain(null);
            listing.setKilometersPerLiter(null);
            listing.setFuelConsumption(null);
            listing.setFuelCapacity(null);
            listing.setHorsePower(null);
            listing.setInspectionValidUntil(null);
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

