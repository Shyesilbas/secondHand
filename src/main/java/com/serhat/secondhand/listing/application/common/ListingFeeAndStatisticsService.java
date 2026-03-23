package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.dashboard.application.DashboardService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingFeeAndStatisticsService {

    private final ListingConfig listingConfig;
    private final DashboardService dashboardService;

    public BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(
                ListingBusinessConstants.PERCENT_DIVISOR,
                ListingBusinessConstants.FEE_TAX_CALCULATION_SCALE,
                ListingBusinessConstants.FEE_TAX_ROUNDING_MODE);
        return fee.add(taxAmount);
    }

    public ListingStatisticsDto getGlobalListingStatistics() {
        return dashboardService.getGlobalListingStatistics();
    }
}

