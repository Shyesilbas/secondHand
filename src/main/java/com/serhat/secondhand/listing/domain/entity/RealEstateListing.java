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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "real_estate_type_id", nullable = false)
    private RealEstateType realEstateType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "heating_type_id", nullable = false)
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

}
