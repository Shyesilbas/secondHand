package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {

    private Long id;
    private Long orderId;
    private ListingDto listing;
    private String sellerName;
    private String sellerSurname;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String currency;
    private String notes;
    private LocalDateTime createdAt;
    private Integer cancelledQuantity;
    private Integer refundedQuantity;
}
