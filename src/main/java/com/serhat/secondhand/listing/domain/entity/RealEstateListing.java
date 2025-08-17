package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "real_estate_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class RealEstateListing extends Listing {

    @Enumerated(EnumType.STRING)
    private RealEstateType realEstateType;

    @Enumerated(EnumType.STRING)
    @Column(name = "heating_type", nullable = false)
    private HeatingType heatingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "ad_type", nullable = false)
    private RealEstateAdType adType;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", nullable = false)
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

}
