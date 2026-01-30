package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

@Component
public class ScooterValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        if (!isType(listing, "SCOOTER")) {
            return Result.success();
        }

        if (listing.getEngineCapacity() == null || listing.getEngineCapacity() <= 0) {
            return Result.error("Engine capacity is required for scooter listings", "SCOOTER_ENGINE_CAPACITY_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (isType(listing, "SCOOTER")) {
            listing.setDoors(null);
            listing.setSeatCount(null);
            listing.setBodyType(null);
            listing.setDrivetrain(null);
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

