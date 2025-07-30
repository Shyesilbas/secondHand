package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.Color;
import com.serhat.secondhand.listing.domain.entity.enums.Doors;
import com.serhat.secondhand.listing.domain.entity.enums.FuelType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_listings")
@DiscriminatorValue("VEHICLE")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VehicleListing extends Listing {

    @Enumerated(EnumType.STRING)
    private CarBrand brand;

    private String model;

    private Integer year;
    private Integer mileage;
    private Integer engineCapacity;
    private Integer gearbox;
    private Integer seatCount;

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
}
