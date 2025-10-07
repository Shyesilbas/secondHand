package com.serhat.secondhand.showcase;

import com.serhat.secondhand.listing.application.util.ListingFavoriteStatsUtil;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShowcaseMapper {
    
    private final ListingMapper listingMapper;
    private final ListingFavoriteStatsUtil favoriteStatsUtil;
    
    public ShowcaseDto toDto(Showcase showcase) {
        // Convert listing to DTO with favorite stats
        var listingDto = listingMapper.toDynamicDto(showcase.getListing());
        favoriteStatsUtil.enrichWithFavoriteStats(listingDto, null); // No user context for public showcases
        
        return ShowcaseDto.builder()
                .id(showcase.getId())
                .listingId(showcase.getListing().getId())
                .userId(showcase.getUser().getId())
                .startDate(showcase.getStartDate())
                .endDate(showcase.getEndDate())
                .totalCost(showcase.getTotalCost())
                .dailyCost(showcase.getDailyCost())
                .status(showcase.getStatus().name())
                .createdAt(showcase.getCreatedAt())
                .updatedAt(showcase.getUpdatedAt())
                .listing(listingDto)
                .build();
    }
}
