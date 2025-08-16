package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import org.springframework.data.domain.Page;

public interface VehicleListingFilterService {
    Page<ListingDto> filterVehicles(VehicleListingFilterDto filters);
}
