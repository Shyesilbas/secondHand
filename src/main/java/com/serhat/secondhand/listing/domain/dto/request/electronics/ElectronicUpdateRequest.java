package com.serhat.secondhand.listing.domain.dto.request.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;
import java.util.Optional;

public record ElectronicUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<String> city,
        Optional<String> district,
        Optional<ElectronicType> electronicType,
        Optional<ElectronicBrand> electronicBrand,
        Optional<String> model,
        Optional<String> origin,
        Optional<Boolean> warrantyProof,
        Optional<Integer> year,
        Optional<Color> color
) {
}
