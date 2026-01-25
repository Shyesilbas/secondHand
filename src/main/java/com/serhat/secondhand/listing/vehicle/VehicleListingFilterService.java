package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import org.springframework.data.domain.Page;

public interface VehicleListingFilterService {
    Page<ListingDto> filterVehicles(VehicleListingFilterDto filters);
}
