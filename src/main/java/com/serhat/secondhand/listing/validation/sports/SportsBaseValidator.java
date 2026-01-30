package com.serhat.secondhand.listing.validation.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import org.springframework.stereotype.Component;

@Component
public class SportsBaseValidator implements SportsSpecValidator {

    @Override
    public Result<Void> validate(SportsListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }
        if (listing.getDiscipline() == null) {
            return Result.error("Sport discipline is required", "SPORT_DISCIPLINE_REQUIRED");
        }
        if (listing.getEquipmentType() == null) {
            return Result.error("Sport equipment type is required", "SPORT_EQUIPMENT_TYPE_REQUIRED");
        }
        if (listing.getCondition() == null) {
            return Result.error("Sport condition is required", "SPORT_CONDITION_REQUIRED");
        }
        return Result.success();
    }

    @Override
    public void cleanup(SportsListing listing) {
    }
}

