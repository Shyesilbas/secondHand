package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.application.GenericListingFilterService;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BooksListingFilterServiceImpl implements BooksListingFilterService {

    private final GenericListingFilterService<BooksListing, BooksListingFilterDto> genericFilterService;
    private final BooksFilterPredicateBuilder predicateBuilder;

    @Override
    public Page<ListingDto> filterBooks(BooksListingFilterDto filters) {
        return genericFilterService.filter(filters, BooksListing.class, predicateBuilder);
    }
}


