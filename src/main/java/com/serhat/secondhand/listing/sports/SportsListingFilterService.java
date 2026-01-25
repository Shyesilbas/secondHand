package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import org.springframework.data.domain.Page;

public interface SportsListingFilterService {
    Page<ListingDto> filterSports(SportsListingFilterDto filters);
}


