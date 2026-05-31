package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class RealEstateSubtypeFieldPolicy implements RealEstateSpecValidator {

    private static final Set<String> RESIDENTIAL_SUBTYPES = new HashSet<>(Arrays.asList(
            "APARTMENT", "RESIDENCE", "STUDIO", "DUPLEX", "PENTHOUSE", "HOUSE", "VILLA", "TOWNHOUSE", "SUMMER_HOUSE", "CHALET", "MANSION"
    ));

    private static final Set<String> LAND_SUBTYPES = new HashSet<>(Arrays.asList(
            "LAND", "FARM", "VINEYARD", "OLIVE_GROVE"
    ));

    private static final Set<String> COMMERCIAL_SUBTYPES = new HashSet<>(Arrays.asList(
            "OFFICE", "COMMERCIAL", "SHOP", "WAREHOUSE", "FACTORY", "INDUSTRIAL", "HOTEL", "PARKING"
    ));

    @Override
    public Result<Void> validate(RealEstateListing listing) {
        RealEstateType type = listing.getRealEstateType();
        if (type == null || type.getName() == null) {
            return Result.success();
        }

        String subtype = type.getName().toUpperCase();

        if (LAND_SUBTYPES.contains(subtype)) {
            // Land listings MUST NOT contain residential or commercial parameters
            if (listing.getRoomConfigKey() != null) {
                return Result.error("Land listing cannot contain roomConfigKey", "SUBTYPE_INCOMPATIBLE_ROOM_CONFIG");
            }
            if (listing.getHeatingTypeKey() != null) {
                return Result.error("Land listing cannot contain heatingTypeKey", "SUBTYPE_INCOMPATIBLE_HEATING");
            }
            if (listing.getFloorNumber() != null) {
                return Result.error("Land listing cannot contain floorNumber", "SUBTYPE_INCOMPATIBLE_FLOOR");
            }
            if (listing.getBuildingAge() != null) {
                return Result.error("Land listing cannot contain buildingAge", "SUBTYPE_INCOMPATIBLE_BUILDING_AGE");
            }
            if (listing.isFurnished()) {
                return Result.error("Land listing cannot be furnished", "SUBTYPE_INCOMPATIBLE_FURNISHED");
            }
            if (listing.getZoningStatusKey() == null || listing.getZoningStatusKey().isBlank()) {
                return Result.error("zoningStatusKey is required for Land listings", "SUBTYPE_ZONING_STATUS_REQUIRED");
            }
        } else if (RESIDENTIAL_SUBTYPES.contains(subtype)) {
            // Residential listings MUST NOT contain land specific parameters
            if (listing.getZoningStatusKey() != null) {
                return Result.error("Residential listing cannot contain zoningStatusKey", "SUBTYPE_INCOMPATIBLE_ZONING");
            }
            if (listing.getParcelNo() != null) {
                return Result.error("Residential listing cannot contain parcelNo", "SUBTYPE_INCOMPATIBLE_PARCEL");
            }
            if (listing.getRoomConfigKey() == null) {
                return Result.error("roomConfigKey is required for Residential listings", "SUBTYPE_ROOM_CONFIG_REQUIRED");
            }
        } else if (COMMERCIAL_SUBTYPES.contains(subtype)) {
            // Commercial listings must not contain land parameters
            if (listing.getZoningStatusKey() != null) {
                return Result.error("Commercial listing cannot contain zoningStatusKey", "SUBTYPE_INCOMPATIBLE_ZONING");
            }
        }

        return Result.success();
    }

    @Override
    public void cleanup(RealEstateListing listing) {
        RealEstateType type = listing.getRealEstateType();
        if (type == null || type.getName() == null) {
            return;
        }

        String subtype = type.getName().toUpperCase();

        // Defensive cleanup before database write
        if (LAND_SUBTYPES.contains(subtype)) {
            listing.setRoomConfigKey(null);
            listing.setHeatingTypeKey(null);
            listing.setFloorNumber(null);
            listing.setTotalFloors(null);
            listing.setBuildingAge(null);
            listing.setBathroomCount(null);
            listing.setFurnished(false);
            listing.setHasBalcony(false);
            listing.setHasElevator(false);
            listing.setHasParking(false);
        } else if (RESIDENTIAL_SUBTYPES.contains(subtype)) {
            listing.setZoningStatusKey(null);
            listing.setParcelNo(null);
            listing.setBlockNo(null);
            listing.setSheetNo(null);
        }
    }
}
