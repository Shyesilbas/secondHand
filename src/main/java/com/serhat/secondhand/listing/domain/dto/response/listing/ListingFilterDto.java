package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public abstract class ListingFilterDto {
    private ListingType listingType;
    private ListingStatus status;
    private String city;
    private String district;
    
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Currency currency;
    
    private String sortBy;
    private String sortDirection;
    
    private Integer page = 0;
    private Integer size = 20;
}