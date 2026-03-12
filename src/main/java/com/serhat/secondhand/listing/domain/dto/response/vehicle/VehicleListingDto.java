package com.serhat.secondhand.listing.domain.dto.response.vehicle;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleListingDto extends ListingDto {

    private LookupDto vehicleType;
    private LookupDto brand;
    private ModelDto model;
    private Integer year;
    private Integer mileage;
    private Integer engineCapacity;
    private GearType gearbox;
    private SeatCount seatCount;
    private Doors doors;
    private Integer wheels;
    private Color color;
    private Integer fuelCapacity;
    private Integer fuelConsumption;
    private Integer horsePower;
    private Integer kilometersPerLiter;
    private FuelType fuelType;
    private Boolean swap;
    private Boolean accidentHistory;
    private String accidentDetails;
    private java.time.LocalDate inspectionValidUntil;
    private Drivetrain drivetrain;
    private BodyType bodyType;
}
