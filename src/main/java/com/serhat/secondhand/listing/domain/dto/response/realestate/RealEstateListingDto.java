package com.serhat.secondhand.listing.domain.dto.response.realestate;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RealEstateListingDto extends ListingDto {
    private LookupDto adType;
    private LookupDto realEstateType;
    private LookupDto heatingType;
    private LookupDto ownerType;

    private Integer grossAreaM2;
    private Integer netAreaM2;
    private String roomConfigKey;
    /** Derived from the room plan. */
    private Integer roomCount;
    private Integer bathroomCount;
    private String floorKey;
    /** Derived from the floor. */
    private Integer floorNumber;
    private Integer totalFloors;
    private Integer buildingAge;
    private String buildingCondition;
    private boolean furnished;
    private boolean hasBalcony;
    private boolean hasElevator;
    private boolean hasParking;
    private BigDecimal monthlyFee;
    private boolean inSite;
    private String siteName;
    private Integer gardenAreaM2;
    private Integer landShareM2;
    private boolean hasPool;
    private String zoningStatusKey;
    private String parcelNo;
    private String blockNo;
    private String sheetNo;
    private BigDecimal floorAreaRatio;
    private BigDecimal heightLimit;
    private BigDecimal roadFrontage;
    private String infrastructureStatusKey;
    private boolean electricityAvailable;
    private boolean roadAccess;
    private boolean exchangeable;

    /** Approximate point (offset around the neighborhood center), null when unknown. */
    private BigDecimal latitude;
    private BigDecimal longitude;
}
