package com.serhat.secondhand.showcase;

import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import org.springframework.stereotype.Component;

@Component
public class ShowcaseMapper {
    
    public ShowcaseDto toDto(Showcase showcase) {
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
                .build();
    }
}
