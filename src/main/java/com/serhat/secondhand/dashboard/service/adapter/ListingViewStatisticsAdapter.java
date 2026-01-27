package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.ListingViewStatisticsPort;
import com.serhat.secondhand.listing.application.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ListingViewStatisticsAdapter implements ListingViewStatisticsPort {

    private final ListingViewService listingViewService;

    @Override
    public ListingViewStatsDto getAggregatedViewStatisticsForSeller(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return listingViewService.getAggregatedViewStatisticsForSeller(sellerId, startDate, endDate);
    }
}

