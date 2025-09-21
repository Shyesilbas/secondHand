package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Doors;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.FuelType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.GearType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.SeatCount;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

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
}
