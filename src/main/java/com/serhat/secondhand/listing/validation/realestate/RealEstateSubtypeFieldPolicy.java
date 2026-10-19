package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateCategory;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validates and cleans up subtype-specific fields based on the real estate category
 * (LAND, RESIDENTIAL, COMMERCIAL, OTHER).
 * Synchronizes and validates catalog spec keys with RealEstateSpecCatalogService.
 */
@Component
@RequiredArgsConstructor
public class RealEstateSubtypeFieldPolicy implements RealEstateSpecValidator {

    private final RealEstateSpecCatalogService specCatalogService;

    @Override
    public Result<Void> validate(RealEstateListing listing) {
        RealEstateType type = listing.getRealEstateType();
        if (type == null || type.getName() == null) {
            return Result.success();
        }

        RealEstateCategory category = RealEstateCategory.fromTypeName(type.getName());

        if (category == RealEstateCategory.LAND) {
            // Land listings MUST NOT contain residential or commercial parameters
            if (listing.getRoomConfigKey() != null) {
                return Result.error("Land listing cannot contain roomConfigKey", "SUBTYPE_INCOMPATIBLE_ROOM_CONFIG");
            }
            if (listing.getHeatingType() != null) {
                return Result.error("Land listing cannot have a heating type", "SUBTYPE_INCOMPATIBLE_HEATING");
            }
            if (listing.getFloorNumber() != null) {
                return Result.error("Land listing cannot contain floorNumber", "SUBTYPE_INCOMPATIBLE_FLOOR");
            }
            if (listing.getBuildingAge() != null && listing.getBuildingAge() > 0) {
                return Result.error("Land listing cannot contain buildingAge", "SUBTYPE_INCOMPATIBLE_BUILDING_AGE");
            }
            if (listing.isFurnished()) {
                return Result.error("Land listing cannot be furnished", "SUBTYPE_INCOMPATIBLE_FURNISHED");
            }

            // Check zoning status: either zoningStatusKey or zoningStatus is acceptable
            String zoningKey = listing.getZoningStatusKey();
            String zoningStatus = listing.getZoningStatus();
            if ((zoningKey == null || zoningKey.isBlank()) && (zoningStatus == null || zoningStatus.isBlank())) {
                return Result.error("zoningStatusKey is required for Land listings", "SUBTYPE_ZONING_STATUS_REQUIRED");
            }
            if (zoningKey != null && !zoningKey.isBlank() && !specCatalogService.isValidZoningStatus(zoningKey)) {
                return Result.error("Invalid zoning status key: " + zoningKey, "INVALID_ZONING_STATUS_KEY");
            }
        } else if (category == RealEstateCategory.RESIDENTIAL) {
            // Residential listings MUST NOT contain land specific parameters
            if (listing.getZoningStatusKey() != null) {
                return Result.error("Residential listing cannot contain zoningStatusKey", "SUBTYPE_INCOMPATIBLE_ZONING");
            }
            if (listing.getParcelNo() != null && !listing.getParcelNo().isBlank()) {
                return Result.error("Residential listing cannot contain parcelNo", "SUBTYPE_INCOMPATIBLE_PARCEL");
            }

            // Check room config: either roomConfigKey or roomCount is acceptable
            String roomKey = listing.getRoomConfigKey();
            Integer roomCount = listing.getRoomCount();
            if ((roomKey == null || roomKey.isBlank()) && (roomCount == null || roomCount <= 0)) {
                return Result.error("roomConfigKey is required for Residential listings", "SUBTYPE_ROOM_CONFIG_REQUIRED");
            }
            if (roomKey != null && !roomKey.isBlank() && !specCatalogService.isValidRoomConfig(roomKey)) {
                return Result.error("Invalid room configuration key: " + roomKey, "INVALID_ROOM_CONFIG_KEY");
            }
        } else if (category == RealEstateCategory.COMMERCIAL) {
            // Commercial listings must not contain land parameters
            if (listing.getZoningStatusKey() != null) {
                return Result.error("Commercial listing cannot contain zoningStatusKey", "SUBTYPE_INCOMPATIBLE_ZONING");
            }
            if (listing.getParcelNo() != null && !listing.getParcelNo().isBlank()) {
                return Result.error("Commercial listing cannot contain parcelNo", "SUBTYPE_INCOMPATIBLE_PARCEL");
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

        RealEstateCategory category = RealEstateCategory.fromTypeName(type.getName());

        if (category == RealEstateCategory.LAND) {
            listing.setRoomConfigKey(null);
            listing.setHeatingType(null);
            listing.setRoomCount(0);
            listing.setFloorNumber(null);
            listing.setTotalFloors(null);
            listing.setBuildingAge(null);
            listing.setBathroomCount(null);
            listing.setFloor(null);
            listing.setFurnished(false);
            listing.setHasBalcony(false);
            listing.setHasElevator(false);
            listing.setHasParking(false);

            // Sync zoningStatus and zoningStatusKey if one is present
            if (listing.getZoningStatusKey() != null && (listing.getZoningStatus() == null || listing.getZoningStatus().isBlank())) {
                specCatalogService.findZoningStatus(listing.getZoningStatusKey())
                        .ifPresent(spec -> listing.setZoningStatus(spec.getLabel()));
            } else if (listing.getZoningStatusKey() == null && listing.getZoningStatus() != null && !listing.getZoningStatus().isBlank()) {
                specCatalogService.findZoningStatus(listing.getZoningStatus())
                        .ifPresent(spec -> listing.setZoningStatusKey(spec.getKey()));
            }
        } else if (category == RealEstateCategory.RESIDENTIAL) {
            listing.setZoningStatusKey(null);
            listing.setZoningStatus(null);
            listing.setParcelNo(null);
            listing.setBlockNo(null);
            listing.setSheetNo(null);
            listing.setFloorAreaRatio(null);
            listing.setHeightLimit(null);
            listing.setRoadFrontage(null);
            listing.setInfrastructureStatusKey(null);

            // Populate roomCount from roomConfigKey if not already set
            if (listing.getRoomConfigKey() != null && (listing.getRoomCount() == null || listing.getRoomCount() <= 0)) {
                specCatalogService.findRoomConfig(listing.getRoomConfigKey())
                        .ifPresent(spec -> {
                            if (spec.getRooms() != null && spec.getRooms() > 0) {
                                listing.setRoomCount(spec.getRooms());
                            }
                        });
            }
        } else if (category == RealEstateCategory.COMMERCIAL) {
            listing.setZoningStatusKey(null);
            listing.setZoningStatus(null);
            listing.setParcelNo(null);
            listing.setBlockNo(null);
            listing.setSheetNo(null);
            listing.setFloorAreaRatio(null);
            listing.setHeightLimit(null);
            listing.setRoadFrontage(null);
            listing.setInfrastructureStatusKey(null);
        }
    }
}
