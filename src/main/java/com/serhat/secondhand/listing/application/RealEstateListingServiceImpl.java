package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealEstateListingServiceImpl implements RealEstateListingFilterService {

    private final GenericListingFilterService<RealEstateListing, RealEstateFilterDto> genericFilterService;
    private final RealEstateFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterRealEstates(RealEstateFilterDto filters) {
        return genericFilterService.filter(filters, RealEstateListing.class, predicateBuilder);
    }
}