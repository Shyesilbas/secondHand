package com.serhat.secondhand.listing.domain.dto;

import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.Color;
import com.serhat.secondhand.listing.domain.entity.enums.Doors;
import com.serhat.secondhand.listing.domain.entity.enums.FuelType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleListingDto extends ListingDto {

    private CarBrand brand;
    private String model;
    private Integer year;
    private Integer mileage;
    private Integer engineCapacity;
    private Integer gearbox;
    private Integer seatCount;
    private Doors doors;
    private Integer wheels;
    private Color color;
    private Integer fuelCapacity;
    private Integer fuelConsumption;
    private Integer horsePower;
    private Integer kilometersPerLiter;
    private FuelType fuelType;
}
