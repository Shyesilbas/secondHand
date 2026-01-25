package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import org.springframework.data.domain.Page;

public interface BooksListingFilterService {
    Page<ListingDto> filterBooks(BooksListingFilterDto filters);
}


