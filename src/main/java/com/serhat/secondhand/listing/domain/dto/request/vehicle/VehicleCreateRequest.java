package com.serhat.secondhand.listing.domain.dto.request.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record VehicleCreateRequest(
    @NotNull @Valid BaseListingCreateRequest base,
    UUID vehicleTypeId,
    UUID brandId,
    UUID vehicleModelId,
    Integer year,
    Integer mileage,
    Integer engineCapacity,
    GearType gearbox,
    SeatCount seatCount,
    Doors doors,
    Integer wheels,
    Color color,
    Integer fuelCapacity,
    Integer fuelConsumption,
    Integer horsePower,
    Integer kilometersPerLiter,
    FuelType fuelType,
    Boolean accidentHistory,
    String accidentDetails,
    java.time.LocalDate inspectionValidUntil,
    Drivetrain drivetrain,
    BodyType bodyType
) {} 