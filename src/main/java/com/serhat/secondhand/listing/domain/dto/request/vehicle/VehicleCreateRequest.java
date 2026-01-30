package com.serhat.secondhand.listing.domain.dto.request.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;

import java.math.BigDecimal;
import java.util.UUID;

public record VehicleCreateRequest(
    String title,
    String description,
    BigDecimal price,
    Currency currency,
    String city,
    String district,
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
    String imageUrl,
    Boolean accidentHistory,
    String accidentDetails,
    java.time.LocalDate inspectionValidUntil,
    Drivetrain drivetrain,
    BodyType bodyType
) {} 