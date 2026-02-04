package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingStatisticsDto {
    

    private long totalListings;
    

    private long activeListings;
    

    private long activeSellerCount;
    

    private long activeCityCount;

    private long vehicleCount;
    private long electronicsCount;
    private long realEstateCount;
    private long clothingCount;
    private long booksCount;
    private long sportsCount;
}