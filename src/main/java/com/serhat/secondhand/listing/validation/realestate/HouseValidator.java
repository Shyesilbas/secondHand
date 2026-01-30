package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.springframework.stereotype.Component;

@Component
public class HouseValidator implements RealEstateSpecValidator {

    @Override
    public Result<Void> validate(RealEstateListing listing) {
        if (!isHouseLike(listing)) {
            return Result.success();
        }

        if (listing.getSquareMeters() == null || listing.getSquareMeters() <= 0) {
            return Result.error("Square meters must be greater than 0", "REAL_ESTATE_SQUARE_METERS_REQUIRED");
        }

        if (listing.getRoomCount() == null || listing.getRoomCount() <= 0) {
            return Result.error("Room count must be greater than 0", "REAL_ESTATE_ROOM_COUNT_REQUIRED");
        }

        if (listing.getHeatingType() == null) {
            return Result.error("Heating type is required for this property type", "REAL_ESTATE_HEATING_TYPE_REQUIRED");
        }

        if (listing.getBathroomCount() != null && listing.getBathroomCount() < 0) {
            return Result.error("Bathroom count must be 0 or greater", "REAL_ESTATE_BATHROOM_COUNT_INVALID");
        }

        if (listing.getFloor() != null && listing.getFloor() < 0) {
            return Result.error("Floor must be 0 or greater", "REAL_ESTATE_FLOOR_INVALID");
        }

        if (listing.getBuildingAge() != null && listing.getBuildingAge() < 0) {
            return Result.error("Building age must be 0 or greater", "REAL_ESTATE_BUILDING_AGE_INVALID");
        }

        return Result.success();
    }

    @Override
    public void cleanup(RealEstateListing listing) {
        if (isHouseLike(listing)) {
            listing.setZoningStatus(null);
        }
    }

    private boolean isHouseLike(RealEstateListing listing) {
        if (listing == null) {
            return false;
        }
        RealEstateType type = listing.getRealEstateType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String name = type.getName();
        return !("LAND".equalsIgnoreCase(name) || "FARM".equalsIgnoreCase(name));
    }
}

