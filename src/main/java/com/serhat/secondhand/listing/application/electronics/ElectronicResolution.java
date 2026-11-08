package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;

/** {@code variant} is null when the seller did not pick one. */
public record ElectronicResolution(
        ElectronicType type,
        ElectronicBrand brand,
        ElectronicModel model,
        ElectronicModelVariant variant
) {}
