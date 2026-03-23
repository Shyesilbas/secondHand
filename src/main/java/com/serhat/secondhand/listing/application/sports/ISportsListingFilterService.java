package com.serhat.secondhand.listing.application.sports;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import org.springframework.data.domain.Page;

public interface ISportsListingFilterService {
    Page<ListingDto> filterSports(SportsListingFilterDto filters);
}

