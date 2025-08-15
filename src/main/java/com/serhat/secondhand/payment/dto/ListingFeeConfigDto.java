package com.serhat.secondhand.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for listing fee configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingFeeConfigDto {
    

    private BigDecimal creationFee;
    

    private BigDecimal promotionFee;
    

    private BigDecimal taxPercentage;

    private BigDecimal totalCreationFee;
}