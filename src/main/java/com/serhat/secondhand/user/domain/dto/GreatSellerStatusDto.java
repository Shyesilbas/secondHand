package com.serhat.secondhand.user.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GreatSellerStatusDto {
    private boolean eligible;
    /** Order items in window: completed payment, TRY, unit price ≥ threshold. */
    private int qualifyingSalesLastWindow;
    private int qualifyingSalesTarget;
    private boolean salesMet;
    private int distinctReviewerCount;
    private int distinctReviewerTarget;
    private boolean reviewersMet;
    private Double averageRating;
    private double minimumAverageRating;
    private boolean ratingMet;
    private BigDecimal minUnitPriceThreshold;
    private int rollingWindowDays;
}
