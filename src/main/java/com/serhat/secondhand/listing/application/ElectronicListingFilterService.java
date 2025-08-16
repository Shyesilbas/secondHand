package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import org.springframework.data.domain.Page;

public interface ElectronicListingFilterService {
    Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters);
}
