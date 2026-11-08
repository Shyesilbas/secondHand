package com.serhat.secondhand.listing.domain.dto.response.electronics;

import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicCondition;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicListingDto extends ListingDto {
   private LookupDto electronicType;
   private LookupDto electronicBrand;
   private ModelDto model;
   /** Catalog variant the listing copied its specs from; null when none was picked. */
   private java.util.UUID electronicVariantId;
   private String variantName;
   private String origin;
   private boolean warrantyProof;
   private Integer year;
   private Color color;
   private String colorName;
   private Integer ram;
   private Integer storage;
   private StorageType storageType;
   private Processor processor;
   private String chipset;
   private Integer screenSize;
   private String gpuModel;
   private String operatingSystem;
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
   private ElectronicCondition condition;
}
