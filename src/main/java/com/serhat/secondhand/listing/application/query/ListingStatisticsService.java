package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.dashboard.application.DashboardService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingStatisticsService {

    private final DashboardService dashboardService;

    public ListingStatisticsDto getGlobalListingStatistics() {
        return dashboardService.getGlobalListingStatistics();
    }
}
