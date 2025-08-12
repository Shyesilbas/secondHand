package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.dto.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ListingRepositoryCustom {
    Page<Listing> findWithFilters(ListingFilterDto filters, Pageable pageable);
}