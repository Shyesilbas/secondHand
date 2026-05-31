package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "real_estate_listings")
@Getter @Setter
@NoArgsConstructor
@SuperBuilder
@org.hibernate.annotations.BatchSize(size = 20)
public class RealEstateListing extends Listing {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "real_estate_type_id", nullable = false)
    private RealEstateType realEstateType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heating_type_id")
    private HeatingType heatingType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ad_type_id", nullable = false)
    private RealEstateAdType adType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_type_id", nullable = false)
    private ListingOwnerType ownerType;

    @Column(name = "square_meters", nullable = false)
    private Integer squareMeters;

    @Column(name = "room_count", nullable = false)
    private Integer roomCount;

    @Column(name = "bathroom_count")
    private Integer bathroomCount;

    @Column(name = "floor")
    private Integer floor;

    @Column(name = "building_age")
    private Integer buildingAge;

    @Column(name = "is_furnished", nullable = false)
    private boolean furnished;

    @Column(name = "zoning_status", length = 120)
    private String zoningStatus;

    // ── New Premium Catalog-Driven Fields ───────────────────────────────

    @Column(name = "gross_area_m2")
    private Integer grossAreaM2;

    @Column(name = "net_area_m2")
    private Integer netAreaM2;

    @Column(name = "usage_status", length = 60)
    private String usageStatus;

    @Column(name = "deed_status", length = 60)
    private String deedStatus;

    // Residential specs
    @Column(name = "room_config_key", length = 60)
    private String roomConfigKey;

    @Column(name = "heating_type_key", length = 60)
    private String heatingTypeKey;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "total_floors")
    private Integer totalFloors;

    @Column(name = "has_balcony", nullable = false)
    private boolean hasBalcony;

    @Column(name = "has_elevator", nullable = false)
    private boolean hasElevator;

    @Column(name = "has_parking", nullable = false)
    private boolean hasParking;

    @Column(name = "monthly_fee")
    private BigDecimal monthlyFee;

    @Column(name = "is_in_site", nullable = false)
    private boolean isInSite;

    @Column(name = "site_name", length = 120)
    private String siteName;

    // Detached / Villa specs
    @Column(name = "garden_area_m2")
    private Integer gardenAreaM2;

    @Column(name = "land_share_m2")
    private Integer landShareM2;

    @Column(name = "has_pool", nullable = false)
    private boolean hasPool;

    // Land specs
    @Column(name = "zoning_status_key", length = 60)
    private String zoningStatusKey;

    @Column(name = "parcel_no", length = 30)
    private String parcelNo;

    @Column(name = "block_no", length = 30)
    private String blockNo;

    @Column(name = "sheet_no", length = 30)
    private String sheetNo;

    @Column(name = "floor_area_ratio")
    private BigDecimal floorAreaRatio;

    @Column(name = "height_limit")
    private BigDecimal heightLimit;

    @Column(name = "road_frontage")
    private BigDecimal roadFrontage;

    @Column(name = "infrastructure_status_key", length = 60)
    private String infrastructureStatusKey;

    // Farm specs
    @Column(name = "water_source", length = 60)
    private String waterSource;

    @Column(name = "electricity_available", nullable = false)
    private boolean electricityAvailable;

    @Column(name = "road_access", nullable = false)
    private boolean roadAccess;
}
