package com.serhat.secondhand.listing.domain.dto.request.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.util.Optional;
import java.util.UUID;

public record VehicleUpdateRequest(
    BaseListingUpdateRequest base,
    Optional<UUID> vehicleTypeId,
    Optional<UUID> brandId,
    Optional<UUID> vehicleModelId,
    Optional<Integer> year,
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
    Optional<FuelType> fuelType,
    Optional<Boolean> swap,
    Optional<Boolean> accidentHistory,
    Optional<String> accidentDetails,
    Optional<java.time.LocalDate> inspectionValidUntil,
    Optional<Drivetrain> drivetrain,
    Optional<BodyType> bodyType
) {} 