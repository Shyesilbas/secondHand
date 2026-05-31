package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.LocationCatalogService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocationValidator {

    private final LocationCatalogService locationCatalogService;

    public Result<Void> validate(Listing listing) {
        String cityKey = listing.getCityKey();
        String districtKey = listing.getDistrictKey();
        String neighborhoodKey = listing.getNeighborhoodKey();

        // 1. If cityKey is provided, check structural validity
        if (cityKey != null && !cityKey.isBlank()) {
            if (!locationCatalogService.isValidCity(cityKey)) {
                return Result.error("Invalid city key: " + cityKey, "LOCATION_INVALID_CITY");
            }
        }

        // 2. If districtKey is provided, check structural validity and relation to cityKey
        if (districtKey != null && !districtKey.isBlank()) {
            if (cityKey == null || cityKey.isBlank()) {
                return Result.error("City key is required when district key is provided", "LOCATION_CITY_REQUIRED_FOR_DISTRICT");
            }
            if (!locationCatalogService.isValidDistrict(cityKey, districtKey)) {
                return Result.error("District " + districtKey + " does not belong to city " + cityKey, "LOCATION_INVALID_DISTRICT_FOR_CITY");
            }
        }

        // 3. If neighborhoodKey is provided, check structural validity and relation to districtKey
        if (neighborhoodKey != null && !neighborhoodKey.isBlank()) {
            if (districtKey == null || districtKey.isBlank()) {
                return Result.error("District key is required when neighborhood key is provided", "LOCATION_DISTRICT_REQUIRED_FOR_NEIGHBORHOOD");
            }
            if (!locationCatalogService.isValidNeighborhood(districtKey, neighborhoodKey)) {
                return Result.error("Neighborhood " + neighborhoodKey + " does not belong to district " + districtKey, "LOCATION_INVALID_NEIGHBORHOOD_FOR_DISTRICT");
            }
        }

        return Result.success();
    }
}
