package com.serhat.secondhand.favorite.domain.dto;

import com.serhat.secondhand.listing.domain.dto.ListingResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteDto {
    
    private Long id;
    private Long userId;
    private ListingResponseDto listing;
    private LocalDateTime createdAt;
}