package com.serhat.secondhand.listing.domain.dto.request;

import com.serhat.secondhand.listing.domain.entity.enums.*;

import java.math.BigDecimal;
import java.util.Optional;

public record VehicleSearchCriteria(
    Optional<CarBrand> brand,
    Optional<String> model,
    Optional<Integer> yearMin,
    Optional<Integer> yearMax,
    Optional<BigDecimal> priceMin,
    Optional<BigDecimal> priceMax,
    Optional<String> city,
    Optional<String> district,
    Optional<Integer> mileageMax,
    Optional<FuelType> fuelType,
    Optional<Doors> doors,
    Optional<Color> color
) {} 