package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

@Component
public class BicycleValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (!isType(listing, "BICYCLE")) {
            return Result.success();
        }

        if (listing.getWheels() != null && listing.getWheels() <= 0) {
            return Result.error("Wheels must be greater than 0", "BICYCLE_WHEELS_INVALID");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (isType(listing, "BICYCLE")) {
            listing.setFuelType(null);
            listing.setFuelCapacity(null);
            listing.setFuelConsumption(null);
            listing.setHorsePower(null);
            listing.setKilometersPerLiter(null);
            listing.setEngineCapacity(null);
            listing.setGearbox(null);
            listing.setDoors(null);
            listing.setSeatCount(null);
            listing.setBodyType(null);
            listing.setDrivetrain(null);
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

