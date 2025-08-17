package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;

public record RealEstateCreateRequest(
        String title,
        String description,
        BigDecimal price,
        Currency currency,
        String city,
        String district,
        RealEstateAdType adType,
        RealEstateType realEstateType,
        HeatingType heatingType,
        ListingOwnerType ownerType,
        Integer squareMeters,
        Integer roomCount,
        Integer bathroomCount,
        Integer floor,
        Integer buildingAge,
        boolean furnished
) {
}
