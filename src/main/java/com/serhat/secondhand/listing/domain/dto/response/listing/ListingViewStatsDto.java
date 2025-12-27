package com.serhat.secondhand.listing.domain.dto.response.listing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingViewStatsDto {
    private Long totalViews;
    private Long uniqueViews;
    private Integer periodDays;
    private Map<LocalDate, Long> viewsByDate;
}

