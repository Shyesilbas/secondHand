package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class ElectronicListingFilterDto extends ListingFilterDto {
    
    private List<UUID> electronicTypeIds;
    private List<UUID> electronicBrandIds;
    private Integer minYear;
    private Integer maxYear;
    private List<Color> colors;
    private Integer minRam;
    private Integer maxRam;
    private Integer minStorage;
    private Integer maxStorage;
    private List<Processor> processors;
    private Integer minScreenSize;
    private Integer maxScreenSize;
}
