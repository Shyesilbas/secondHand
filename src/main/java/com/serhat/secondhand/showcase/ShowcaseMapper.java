package com.serhat.secondhand.showcase;

import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ShowcaseMapper {
    
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService listingEnrichmentService;
    
    public ShowcaseDto toDto(Showcase showcase) {
        var listingDto = listingMapper.toDynamicDto(showcase.getListing());
        listingEnrichmentService.enrichInPlace(listingDto, null);
        
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

    public List<ShowcaseDto> toDtos(List<Showcase> showcases, Long userId) {
        List<ShowcaseDto> dtos = showcases.stream()
                .map(showcase -> {
                    var listingDto = listingMapper.toDynamicDto(showcase.getListing());
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
                })
                .toList();

        List<com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto> listingDtos = dtos.stream()
                .map(ShowcaseDto::listing)
                .filter(java.util.Objects::nonNull)
                .toList();

        listingEnrichmentService.enrich(listingDtos, userId);
        return dtos;
    }

    public Showcase fromCreateRequest(ShowcasePaymentRequest request, User user, Listing listing, 
                                     BigDecimal dailyCost, BigDecimal totalCost, LocalDateTime startDate, LocalDateTime endDate) {
        return Showcase.builder()
                .listing(listing)
                .user(user)
                .startDate(startDate)
                .endDate(endDate)
                .totalCost(totalCost)
                .dailyCost(dailyCost)
                .status(ShowcaseStatus.ACTIVE)
                .build();
    }

    public BigDecimal calculateDailyCostWithTax(BigDecimal dailyCost, BigDecimal taxPercentage) {
        return dailyCost
                .multiply(taxPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .add(dailyCost);
    }

    public BigDecimal calculateTotalCost(BigDecimal dailyCostWithTax, int days) {
        return dailyCostWithTax.multiply(new BigDecimal(days));
    }


    public ShowcasePricingDto toPricingDto(BigDecimal dailyCost, BigDecimal taxPercentage) {
        BigDecimal dailyCostTax = dailyCost
                .multiply(taxPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalDailyCost = dailyCost.add(dailyCostTax);

        return ShowcasePricingDto.builder()
                .dailyCost(dailyCost)
                .taxPercentage(taxPercentage)
                .totalDailyCost(totalDailyCost)
                .build();
    }
}
