package com.serhat.secondhand.listing.domain.dto.request.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;

import java.math.BigDecimal;
import java.util.Optional;

public record VehicleUpdateRequest(
    Optional<String> title,
    Optional<String> description,
    Optional<BigDecimal> price,
    Optional<Currency> currency,
    Optional<String> city,
    Optional<String> district,
    Optional<String> model,
    Optional<Integer> mileage,
    Optional<Integer> engineCapacity,
    Optional<GearType> gearbox,
    Optional<SeatCount> seatCount,
    Optional<Doors> doors,
    Optional<Integer> wheels,
    Optional<Color> color,
    Optional<Integer> fuelCapacity,
    Optional<Integer> fuelConsumption,
    Optional<Integer> horsePower,
    Optional<Integer> kilometersPerLiter,
    Optional<FuelType> fuelType
) {} 