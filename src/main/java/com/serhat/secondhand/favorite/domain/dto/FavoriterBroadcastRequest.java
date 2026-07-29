package com.serhat.secondhand.favorite.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriterBroadcastRequest {

    @NotNull(message = "Discounted price is required")
    @DecimalMin(value = "0.01", message = "Discounted price must be greater than zero")
    private BigDecimal discountedPrice;

    @Builder.Default
    private Integer expirationHours = 48;
}
