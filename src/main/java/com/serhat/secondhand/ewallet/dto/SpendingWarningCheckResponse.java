package com.serhat.secondhand.ewallet.dto;

import java.math.BigDecimal;

public record SpendingWarningCheckResponse(
    boolean warningTriggered,
    BigDecimal currentSpending,
    BigDecimal warningLimit,
    BigDecimal projectedSpending,
    double usagePercentage
) {}
