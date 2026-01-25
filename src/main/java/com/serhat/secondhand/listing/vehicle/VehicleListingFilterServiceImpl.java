package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.listing.application.GenericListingFilterService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleListingFilterServiceImpl implements VehicleListingFilterService {

    private final GenericListingFilterService<VehicleListing, VehicleListingFilterDto> genericFilterService;
    private final VehicleFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterVehicles(VehicleListingFilterDto filters) {
        return genericFilterService.filter(filters, VehicleListing.class, predicateBuilder);
    }
}