package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
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
    // Campaign snapshot taken at checkout; all null on lines without a campaign record.
    private String campaignName;
    private BigDecimal originalUnitPrice;
    private BigDecimal campaignDiscount;
    private Currency currency;
    private String notes;
    private LocalDateTime createdAt;
    private Integer cancelledQuantity;
    private Integer refundedQuantity;
    /** Quantity not yet cancelled or refunded; only lines with a positive value can be compensated. */
    private Integer remainingQuantity;
    private String cancelReason;
    private String cancelReasonText;
    private String refundReason;
    private String refundReasonText;
}
