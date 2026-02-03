package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class ElectronicListingFilterDto extends ListingFilterDto {
    
    private List<UUID> electronicTypeIds;
    private List<UUID> electronicBrandIds;
    private List<UUID> electronicModelIds;
    private Integer minYear;
    private Integer maxYear;
    private List<Color> colors;
    private Integer minRam;
    private Integer maxRam;
    private Integer minStorage;
    private Integer maxStorage;
    private List<StorageType> storageTypes;
    private List<Processor> processors;
    private Integer minScreenSize;
    private Integer maxScreenSize;
    private Integer minBatteryHealthPercent;
    private Integer maxBatteryHealthPercent;
    private Integer minBatteryCapacityMah;
    private Integer maxBatteryCapacityMah;
    private Integer minCameraMegapixels;
    private Integer maxCameraMegapixels;
    private Boolean supports5g;
    private Boolean dualSim;
    private Boolean hasNfc;
    private List<ElectronicConnectionType> connectionTypes;
    private Boolean wireless;
    private Boolean noiseCancelling;
    private Boolean hasMicrophone;
    private Integer minBatteryLifeHours;
    private Integer maxBatteryLifeHours;
}
