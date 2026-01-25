package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import org.springframework.data.domain.Page;

public interface ClothingListingFilterService {
    Page<ListingDto> filterClothing(ClothingListingFilterDto filters);
}
