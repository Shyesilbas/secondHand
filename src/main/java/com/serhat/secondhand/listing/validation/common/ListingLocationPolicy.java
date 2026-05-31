package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.springframework.stereotype.Component;

import java.util.EnumSet;

@Component
public class ListingLocationPolicy {

    // Categories that strictly require City and District location keys
    private static final EnumSet<ListingType> REQUIRED_LOCATION_TYPES = EnumSet.of(
            ListingType.REAL_ESTATE,
            ListingType.VEHICLE,
            ListingType.ELECTRONICS,
            ListingType.CLOTHING
    );

    public Result<Void> validate(Listing listing) {
        ListingType type = listing.getListingType();
        if (type == null) {
            return Result.success();
        }

        if (REQUIRED_LOCATION_TYPES.contains(type)) {
            String cityKey = listing.getCityKey();
            String districtKey = listing.getDistrictKey();

            if (cityKey == null || cityKey.isBlank()) {
                return Result.error("City location key is required for " + type + " listings", "LOCATION_CITY_KEY_REQUIRED");
            }
            if (districtKey == null || districtKey.isBlank()) {
                return Result.error("District location key is required for " + type + " listings", "LOCATION_DISTRICT_KEY_REQUIRED");
            }
        }

        return Result.success();
    }
}
