package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.serhat.secondhand.review.dto.ReviewDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = VehicleListingDto.class, name = "VEHICLE"),
    @JsonSubTypes.Type(value = ElectronicListingDto.class, name = "ELECTRONICS"),
    @JsonSubTypes.Type(value = RealEstateListingDto.class, name = "REAL_ESTATE"),
    @JsonSubTypes.Type(value = ClothingListingDto.class, name = "CLOTHING")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class ListingDto {

    private UUID id;
    private String listingNo;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private Currency currency;
    private ListingStatus status;
    private boolean isListingFeePaid;
    private String city;
    private String district;
    private String imageUrl;
    private String sellerName;
    private String sellerSurname;
    private Long sellerId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate sellerAccountCreationDate;
    
    private ListingType type;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") 
    private LocalDateTime updatedAt;
    
    private FavoriteStatsDto favoriteStats;
    private ReviewStatsDto reviewStats;
    private List<ReviewDto> reviews;
    private ListingViewStatsDto viewStats;

    private BigDecimal campaignPrice;
    private BigDecimal campaignDiscountAmount;
    private CampaignDiscountKind campaignDiscountKind;
    private BigDecimal campaignValue;
    private UUID campaignId;
    private String campaignName;
}
