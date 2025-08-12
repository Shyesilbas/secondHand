package com.serhat.secondhand.listing.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.listing.domain.entity.enums.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingResponseDto {
    
    private UUID id;
    private String listingNo;
    private String title;
    private String description;
    private BigDecimal price;
    private Currency currency;
    private ListingStatus status;
    private String city;
    private String district;
    private String sellerName;
    private String sellerSurname;
    private Long sellerId;
    private String type; // VEHICLE, ELECTRONICS, etc.
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") 
    private LocalDateTime updatedAt;
} 