package com.serhat.secondhand.listing.domain.dto.response.listing;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SportsListingFilterDto extends ListingFilterDto {
    private List<UUID> disciplineIds;
    private List<UUID> equipmentTypeIds;
    private List<UUID> conditionIds;
}


