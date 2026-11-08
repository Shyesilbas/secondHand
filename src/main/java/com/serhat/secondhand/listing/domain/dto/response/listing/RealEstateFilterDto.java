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
    private Integer minGrossArea;
    private Integer maxGrossArea;
    private Integer minNetArea;
    private Integer maxNetArea;
    private List<String> roomConfigKeys;
    private Integer minRoomCount;
    private Integer maxRoomCount;
    private Integer minFloor;
    private Integer maxFloor;
    private Integer minBuildingAge;
    private Integer maxBuildingAge;
    private List<String> zoningStatusKeys;
    private boolean furnished;
    private boolean hasElevator;
    private boolean hasParking;
    private boolean inSite;
    /** listings.attributes */
    private List<String> deedStatuses;
    private Boolean loanEligible;
}
