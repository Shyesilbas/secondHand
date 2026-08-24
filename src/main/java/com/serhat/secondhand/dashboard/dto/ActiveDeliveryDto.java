package com.serhat.secondhand.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveDeliveryDto {
    private Long orderId;
    private String orderNumber;
    private String status;
    private UUID listingId;
    private String listingTitle;
    private String listingImageUrl;
    private BigDecimal price;
    private String sellerName;
    private Long sellerId;
    private String trackingNumber;
    private String carrierName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderDate;
}
