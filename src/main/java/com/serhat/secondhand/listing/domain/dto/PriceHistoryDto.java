package com.serhat.secondhand.listing.domain.dto;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PriceHistoryDto {
    private Long id;
    private UUID listingId;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private Currency currency;
    private LocalDateTime changeDate;
    private String changeReason;
    private BigDecimal percentageChange;
}
