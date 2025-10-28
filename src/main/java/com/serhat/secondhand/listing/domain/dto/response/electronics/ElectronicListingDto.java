package com.serhat.secondhand.listing.domain.dto.response.electronics;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
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
   private String model;
   private String origin;
   private boolean warrantyProof;
   private Integer year;
   private Color color;
   private Integer ram;
   private Integer storage;
   private Processor processor;
   private Integer screenSize;

}
