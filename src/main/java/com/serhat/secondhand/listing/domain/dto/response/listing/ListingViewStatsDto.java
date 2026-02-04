package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingViewStatsDto {
    private Long totalViews;
    private Long uniqueViews;
    private Integer periodDays;
    private Map<LocalDate, Long> viewsByDate;
}

