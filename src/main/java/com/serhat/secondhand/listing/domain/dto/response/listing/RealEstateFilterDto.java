package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class RealEstateFilterDto extends ListingFilterDto {
    private RealEstateAdType adType;
    private List<RealEstateType> realEstateTypes;
    private List<HeatingType> heatingTypes;
    private ListingOwnerType ownerType;
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
}
