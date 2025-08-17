package com.serhat.secondhand.listing.domain.dto.response.realestate;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RealEstateListingDto extends ListingDto {
    private RealEstateAdType adType;
    private RealEstateType realEstateType;
    private HeatingType heatingType;
    private ListingOwnerType ownerType;
    private Integer squareMeters;
    private Integer roomCount;
    private Integer bathroomCount;
    private Integer floor;
    private Integer buildingAge;
    private boolean furnished;
}
