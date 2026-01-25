package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import org.springframework.data.domain.Page;

public interface RealEstateListingFilterService {
    Page<ListingDto> filterRealEstates(RealEstateFilterDto filters);

}
