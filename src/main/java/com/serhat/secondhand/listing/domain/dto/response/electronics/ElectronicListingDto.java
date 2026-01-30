package com.serhat.secondhand.listing.domain.dto.response.electronics;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicListingDto extends ListingDto {
   private ElectronicType electronicType;
   private ElectronicBrand electronicBrand;
   private ElectronicModel model;
   private String origin;
   private boolean warrantyProof;
   private Integer year;
   private Color color;
   private Integer ram;
   private Integer storage;
   private StorageType storageType;
   private Processor processor;
   private Integer screenSize;
   private String gpuModel;
   private String operatingSystem;
   private Integer batteryHealthPercent;
   private Integer batteryCapacityMah;
   private Integer cameraMegapixels;
   private Boolean supports5g;
   private Boolean dualSim;
   private Boolean hasNfc;
   private ElectronicConnectionType connectionType;
   private Boolean wireless;
   private Boolean noiseCancelling;
   private Boolean hasMicrophone;
   private Integer batteryLifeHours;

}
