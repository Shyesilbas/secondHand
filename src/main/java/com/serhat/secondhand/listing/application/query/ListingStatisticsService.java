package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.dashboard.application.DashboardService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingStatisticsService {

    private final DashboardService dashboardService;

    /**
     * Public home-page counters: five count queries (two COUNT DISTINCT) per call, so the result is cached for the
     * short tier (CacheConfig) instead of running on every anonymous request.
     */
    @Cacheable(value = "listing:globalStats", key = "'global'")
    public ListingStatisticsDto getGlobalListingStatistics() {
        return dashboardService.getGlobalListingStatistics();
    }
}
