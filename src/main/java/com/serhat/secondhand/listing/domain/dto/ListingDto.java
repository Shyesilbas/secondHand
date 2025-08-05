package com.serhat.secondhand.listing.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.serhat.secondhand.listing.domain.entity.enums.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = VehicleListingDto.class, name = "VEHICLE")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class ListingDto {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private Currency currency;
    private ListingStatus status;
    private boolean isListingFeePaid;
    private String city;
    private String district;
    private String sellerName;
    private String sellerSurname;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") 
    private LocalDateTime updatedAt;
}
