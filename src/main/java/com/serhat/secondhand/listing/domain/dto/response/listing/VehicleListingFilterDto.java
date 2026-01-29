package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.BodyType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Doors;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Drivetrain;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.FuelType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.GearType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.SeatCount;

@Data
@EqualsAndHashCode(callSuper = true)
public class VehicleListingFilterDto extends ListingFilterDto {
    
    private List<UUID> brandIds;
    private Integer minYear;
    private Integer maxYear;
    private Integer maxMileage;
    private List<FuelType> fuelTypes;
    private List<Color> colors;
    private Doors doors;
    private List<GearType> gearTypes;
    private List<SeatCount> seatCounts;
    private List<Drivetrain> drivetrains;
    private List<BodyType> bodyTypes;
}
