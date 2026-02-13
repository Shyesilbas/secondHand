package com.serhat.secondhand.cart.dto;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {

    private Long id;
    private Long userId;
    private ListingDto listing;
    private Integer quantity;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Instant reservedAt;
    private Instant reservationEndTime;
    private Boolean isReserved;
}
