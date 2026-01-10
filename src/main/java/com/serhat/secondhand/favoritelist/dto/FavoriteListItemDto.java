package com.serhat.secondhand.favoritelist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteListItemDto {

    private Long id;
    private UUID listingId;
    private String listingTitle;
    private BigDecimal listingPrice;
    private String listingCurrency;
    private String listingImageUrl;
    private String listingStatus;
    private String note;
    private LocalDateTime addedAt;
}

