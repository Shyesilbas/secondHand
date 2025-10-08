package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClothingListingFilterServiceImpl implements ClothingListingFilterService {

    private final GenericListingFilterService<ClothingListing, ClothingListingFilterDto> genericFilterService;
    private final ClothingFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterClothing(ClothingListingFilterDto filters) {
        return genericFilterService.filter(filters, ClothingListing.class, predicateBuilder);
    }
}