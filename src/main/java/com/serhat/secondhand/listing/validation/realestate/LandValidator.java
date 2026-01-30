package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.springframework.stereotype.Component;

@Component
public class LandValidator implements RealEstateSpecValidator {

    @Override
    public Result<Void> validate(RealEstateListing listing) {
        if (!isLandLike(listing)) {
            return Result.success();
        }

        if (listing.getSquareMeters() == null || listing.getSquareMeters() <= 0) {
            return Result.error("Square meters must be greater than 0", "LAND_SQUARE_METERS_REQUIRED");
        }

        String zoningStatus = listing.getZoningStatus();
        if (zoningStatus == null || zoningStatus.isBlank()) {
            return Result.error("Zoning status is required for land listings", "LAND_ZONING_STATUS_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(RealEstateListing listing) {
        if (!isLandLike(listing)) {
            return;
        }

        listing.setHeatingType(null);
        listing.setRoomCount(0);
        listing.setBathroomCount(null);
        listing.setFloor(null);
        listing.setBuildingAge(null);
        listing.setFurnished(false);
    }

    private boolean isLandLike(RealEstateListing listing) {
        if (listing == null) {
            return false;
        }
        RealEstateType type = listing.getRealEstateType();
        if (type == null || type.getName() == null) {
            return false;
        }
        String name = type.getName();
        return "LAND".equalsIgnoreCase(name) || "FARM".equalsIgnoreCase(name);
    }
}

