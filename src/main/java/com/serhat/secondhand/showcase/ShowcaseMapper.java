package com.serhat.secondhand.showcase;

import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShowcaseMapper {
    
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService listingEnrichmentService;
    
    public ShowcaseDto toDto(Showcase showcase) {
        var listingDto = sanitizeListingDto(listingMapper.toDynamicDto(showcase.getListing()), showcase.getId());
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
                    var listingDto = sanitizeListingDto(listingMapper.toDynamicDto(showcase.getListing()), showcase.getId());
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

        List<ListingDto> listingDtos = dtos.stream()
                .map(ShowcaseDto::listing)
                .filter(java.util.Objects::nonNull)
                .toList();

        listingEnrichmentService.enrich(listingDtos, userId);
        return dtos;
    }

    private ListingDto sanitizeListingDto(ListingDto listingDto, java.util.UUID showcaseId) {
        if (listingDto != null && listingDto.getType() == null) {
            log.warn("Showcase {} mapped listing without type; listing removed from response/cache", showcaseId);
            return null;
        }
        return listingDto;
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

    public ShowcasePricingDto toPricingDto(BigDecimal dailyCost, BigDecimal taxPercentage, BigDecimal totalDailyCost,
                                           Integer maxDays) {
        return ShowcasePricingDto.builder()
                .dailyCost(dailyCost)
                .taxPercentage(taxPercentage)
                .dailyTaxAmount(totalDailyCost.subtract(dailyCost))
                .totalDailyCost(totalDailyCost)
                .maxDays(maxDays)
                .build();
    }
}
