package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SportsCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull Currency currency,
        @NotBlank String city,
        @NotBlank String district,
        @NotNull SportDiscipline discipline,
        @NotNull SportEquipmentType equipmentType,
        @NotNull SportCondition condition,
        String imageUrl
) {}


