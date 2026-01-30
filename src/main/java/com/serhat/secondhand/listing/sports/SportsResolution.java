package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;

public record SportsResolution(
        SportDiscipline discipline,
        SportEquipmentType equipmentType,
        SportCondition condition
) {}

