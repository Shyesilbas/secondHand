package com.serhat.secondhand.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingFeeConfigDto {
    

    private BigDecimal creationFee;
    

    private BigDecimal taxPercentage;

    private BigDecimal taxAmount;

    private BigDecimal totalCreationFee;

    /** Listing types that pay the creation fee; all other types pay commission on the sale. */
    private java.util.List<com.serhat.secondhand.listing.domain.entity.enums.base.ListingType> feeBearingTypes;
}