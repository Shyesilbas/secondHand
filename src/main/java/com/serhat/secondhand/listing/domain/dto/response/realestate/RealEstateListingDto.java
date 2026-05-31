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
    private Integer squareMeters;
    private Integer roomCount;
    private Integer bathroomCount;
    private Integer floor;
    private Integer buildingAge;
    private boolean furnished;
    private String zoningStatus;

    // Premium fields
    private Integer grossAreaM2;
    private Integer netAreaM2;
    private String usageStatus;
    private String deedStatus;
    private String roomConfigKey;
    private String heatingTypeKey;
    private Integer floorNumber;
    private Integer totalFloors;
    private boolean hasBalcony;
    private boolean hasElevator;
    private boolean hasParking;
    private BigDecimal monthlyFee;
    private boolean isInSite;
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
    private String waterSource;
    private boolean electricityAvailable;
    private boolean roadAccess;
}
