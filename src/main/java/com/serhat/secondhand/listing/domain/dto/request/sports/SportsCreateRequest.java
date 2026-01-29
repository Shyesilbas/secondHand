package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record SportsCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull Currency currency,
        @NotNull @Min(1) Integer quantity,
        @NotBlank String city,
        @NotBlank String district,
        @NotNull UUID disciplineId,
        @NotNull UUID equipmentTypeId,
        @NotNull UUID conditionId,
        String imageUrl
) {}


