package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import org.springframework.data.domain.Page;

public interface BaseListingFilterService {
    Page<ListingDto> filterAllListings(ListingFilterDto filters);
}
