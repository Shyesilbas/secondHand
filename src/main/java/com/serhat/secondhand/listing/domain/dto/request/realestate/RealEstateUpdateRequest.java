package com.serhat.secondhand.listing.domain.dto.request.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;
import java.util.Optional;

public record RealEstateUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<String> city,
        Optional<String> district,
        Optional<RealEstateAdType> adType,
        Optional<RealEstateType> realEstateType,
        Optional<HeatingType> heatingType,
        Optional<ListingOwnerType> ownerType,
        Optional<Integer> squareMeters,
        Optional<Integer> roomCount,
        Optional<Integer>  bathroomCount,
        Optional<Integer>   floor,
        Optional<Integer>   buildingAge,
        Optional<Boolean> furnished
) {
}
