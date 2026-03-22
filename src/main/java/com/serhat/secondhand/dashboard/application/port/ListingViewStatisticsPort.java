package com.serhat.secondhand.dashboard.application.port;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;

import java.time.LocalDateTime;

public interface ListingViewStatisticsPort {

    ListingViewStatsDto getAggregatedViewStatisticsForSeller(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);
}

