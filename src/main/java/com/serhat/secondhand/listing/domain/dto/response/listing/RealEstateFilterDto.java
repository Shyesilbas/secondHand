package com.serhat.secondhand.listing.domain.dto.response.listing;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class RealEstateFilterDto extends ListingFilterDto {
    private UUID adTypeId;
    private List<UUID> realEstateTypeIds;
    private List<UUID> heatingTypeIds;
    private UUID ownerTypeId;
    private Integer minSquareMeters;
    private Integer maxSquareMeters;
    private Integer minRoomCount;
    private Integer maxRoomCount;
    private Integer minBathroomCount;
    private Integer maxBathroomCount;
    private Integer floor;
    private Integer minBuildingAge;
    private Integer maxBuildingAge;
    private boolean furnished;
    private String zoningStatus;
}
