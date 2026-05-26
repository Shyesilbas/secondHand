package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;

public record VehicleResolution(
        VehicleType type,
        CarBrand brand,
        VehicleModel model,
        VehicleGeneration generation,
        VehicleEngine engine,
        VehicleTrim trim
) {}

