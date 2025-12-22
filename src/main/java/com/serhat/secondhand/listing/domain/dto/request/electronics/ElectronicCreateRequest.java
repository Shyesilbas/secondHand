package com.serhat.secondhand.listing.domain.dto.request.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ElectronicCreateRequest (
        String title,
        String description,
        BigDecimal price,
        Currency currency,
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,
        String city,
        String district,
        ElectronicType electronicType,
        ElectronicBrand electronicBrand,
        String model,
        String origin,
        boolean warrantyProof,
        int year,
        Color color,
        String imageUrl,
        Integer ram,
        Integer storage,
        Processor processor,
        Integer screenSize
        ){
}
