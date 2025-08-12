package com.serhat.secondhand.listing.domain.dto;

import com.serhat.secondhand.listing.domain.entity.enums.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ListingFilterDto {
    // Basic filters
    private ListingType listingType;
    private ListingStatus status;
    private String city;
    private String district;
    
    // Price filters
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Currency currency;
    
    // Vehicle specific filters
    private List<CarBrand> brands;
    private Integer minYear;
    private Integer maxYear;
    private Integer maxMileage;
    private List<FuelType> fuelTypes;
    private List<Color> colors;
    private Doors doors;
    private List<GearType> gearTypes;
    private List<SeatCount> seatCounts;
    
    // Sorting
    private String sortBy; // price, createdAt, year, mileage
    private String sortDirection; // ASC, DESC
    
    // Pagination
    private Integer page = 0;
    private Integer size = 20;
}