package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "listingType",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = VehicleListingFilterDto.class, name = "VEHICLE"),
        @JsonSubTypes.Type(value = ElectronicListingFilterDto.class, name = "ELECTRONICS"),
        @JsonSubTypes.Type(value = RealEstateFilterDto.class, name = "REAL_ESTATE"),
        @JsonSubTypes.Type(value = BooksListingFilterDto.class, name = "BOOKS"),
        @JsonSubTypes.Type(value = ClothingListingFilterDto.class, name = "CLOTHING"),
        @JsonSubTypes.Type(value = SportsListingFilterDto.class, name = "SPORTS")
})
public abstract class ListingFilterDto {
    private ListingType listingType;
    private ListingStatus status;
    private String city;
    private String district;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Currency currency;

    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    private Integer page = 0;
    private Integer size = 10;
}
