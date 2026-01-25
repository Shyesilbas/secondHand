package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.listing.application.GenericListingFilterService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SportsListingFilterServiceImpl implements SportsListingFilterService {

    private final GenericListingFilterService<SportsListing, SportsListingFilterDto> genericFilterService;
    private final SportsFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterSports(SportsListingFilterDto filters) {
        return genericFilterService.filter(filters, SportsListing.class, predicateBuilder);
    }
}