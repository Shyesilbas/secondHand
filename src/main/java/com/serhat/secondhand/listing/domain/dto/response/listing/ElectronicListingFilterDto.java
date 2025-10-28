package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ElectronicListingFilterDto extends ListingFilterDto {
    
    private List<ElectronicType> electronicTypes;
    private List<ElectronicBrand> electronicBrands;
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
