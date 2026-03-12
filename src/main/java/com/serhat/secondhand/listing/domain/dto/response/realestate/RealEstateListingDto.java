package com.serhat.secondhand.listing.domain.dto.response.realestate;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RealEstateListingDto extends ListingDto {
    private LookupDto adType;
    private LookupDto realEstateType;
    private LookupDto heatingType;
    private LookupDto ownerType;
    private Integer squareMeters;
    private Integer roomCount;
    private Integer bathroomCount;
    private Integer floor;
    private Integer buildingAge;
    private boolean furnished;
    private String zoningStatus;
}
