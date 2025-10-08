package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingFilterServiceImpl implements ElectronicListingFilterService {

    private final GenericListingFilterService<ElectronicListing, ElectronicListingFilterDto> genericFilterService;
    private final ElectronicsFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        return genericFilterService.filter(filters, ElectronicListing.class, predicateBuilder);
    }
}