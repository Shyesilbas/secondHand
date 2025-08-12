package com.serhat.secondhand.favorite.domain.mapper;

import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FavoriteMapper {
    
    private final ListingMapper listingMapper;
    
    public FavoriteDto toDto(Favorite favorite) {
        if (favorite == null) {
            return null;
        }
        
        return FavoriteDto.builder()
            .id(favorite.getId())
            .userId(favorite.getUser().getId())
            .listing(listingMapper.toListingResponseDto(favorite.getListing()))
            .createdAt(favorite.getCreatedAt())
            .build();
    }
}