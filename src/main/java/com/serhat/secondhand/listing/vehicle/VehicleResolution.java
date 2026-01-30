package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;

public record VehicleResolution(
        VehicleType type,
        CarBrand brand,
        VehicleModel model
) {}

