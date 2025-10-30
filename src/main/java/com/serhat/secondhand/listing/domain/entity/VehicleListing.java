package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class VehicleListing extends Listing {

    @Enumerated(EnumType.STRING)
    private CarBrand brand;

    private String model;

    private Integer year;
    private Integer mileage;
    private Integer engineCapacity;
    
    @Enumerated(EnumType.STRING)
    private GearType gearbox;
    
    @Enumerated(EnumType.STRING)
    private SeatCount seatCount;

    @Enumerated(EnumType.STRING)
    private Doors doors;

    private Integer wheels;

    @Enumerated(EnumType.STRING)
    private Color color;

    private Integer fuelCapacity;
    private Integer fuelConsumption;
    private Integer horsePower;
    private Integer kilometersPerLiter;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    private boolean swap;

    private Boolean accidentHistory;

    private String accidentDetails;

    private LocalDate inspectionValidUntil;

    @Enumerated(EnumType.STRING)
    private Drivetrain drivetrain;

    @Enumerated(EnumType.STRING)
    private BodyType bodyType;
}
