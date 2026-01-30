package com.serhat.secondhand.listing.domain.dto.request.common;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BaseListingCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull Currency currency,
        @NotBlank String city,
        @NotBlank String district,
        String imageUrl
) {}

