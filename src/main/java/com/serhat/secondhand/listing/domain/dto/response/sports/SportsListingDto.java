package com.serhat.secondhand.listing.domain.dto.response.sports;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SportsListingDto extends ListingDto {
    private SportDiscipline discipline;
    private SportEquipmentType equipmentType;
    private SportCondition condition;
}


