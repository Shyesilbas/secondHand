package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public record SportsUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<Integer> quantity,
        Optional<String> city,
        Optional<String> district,
        Optional<UUID> disciplineId,
        Optional<UUID> equipmentTypeId,
        Optional<UUID> conditionId,
        Optional<String> imageUrl
) {}


