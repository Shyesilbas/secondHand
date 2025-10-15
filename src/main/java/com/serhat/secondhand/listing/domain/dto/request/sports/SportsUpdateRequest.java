package com.serhat.secondhand.listing.domain.dto.request.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import java.math.BigDecimal;
import java.util.Optional;

public record SportsUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<String> city,
        Optional<String> district,
        Optional<SportDiscipline> discipline,
        Optional<SportEquipmentType> equipmentType,
        Optional<SportCondition> condition,
        Optional<String> imageUrl
) {}


