package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class VehicleListingFilterDto extends ListingFilterDto {
    
    private List<CarBrand> brands;
    private Integer minYear;
    private Integer maxYear;
    private Integer maxMileage;
    private List<FuelType> fuelTypes;
    private List<Color> colors;
    private Doors doors;
    private List<GearType> gearTypes;
    private List<SeatCount> seatCounts;
}
