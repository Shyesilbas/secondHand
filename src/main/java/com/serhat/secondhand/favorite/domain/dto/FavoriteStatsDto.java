package com.serhat.secondhand.favorite.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteStatsDto {
    
    private UUID listingId;
    private Long favoriteCount;
    
    private boolean isFavorited;
}