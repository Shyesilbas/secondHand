package com.serhat.secondhand.ewallet.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record EwalletRequest(
        @Positive
        BigDecimal limit,

        @Nullable
        @PositiveOrZero
        BigDecimal spendingWarningLimit
) {
}
