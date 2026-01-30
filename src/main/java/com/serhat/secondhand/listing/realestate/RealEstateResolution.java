package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;

public record RealEstateResolution(
        RealEstateAdType adType,
        RealEstateType realEstateType,
        HeatingType heatingType,
        ListingOwnerType ownerType
) {}

