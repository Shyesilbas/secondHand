package com.serhat.secondhand.offer.dto;

import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.offer.entity.OfferStatus;
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
public class OfferDto {
    private UUID id;

    private UUID listingId;
    private String listingTitle;
    private String listingImageUrl;

    private Long buyerId;
    private String buyerName;
    private String buyerSurname;

    private Long sellerId;
    private String sellerName;
    private String sellerSurname;

    private Integer quantity;
    private BigDecimal totalPrice;

    private OfferStatus status;
    private OfferActor createdBy;

    private UUID parentOfferId;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}

