package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;

public record ElectronicResolution(
        ElectronicType type,
        ElectronicBrand brand,
        ElectronicModel model
) {}