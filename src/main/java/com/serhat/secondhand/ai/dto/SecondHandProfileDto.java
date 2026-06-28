package com.serhat.secondhand.ai.dto;

import java.math.BigDecimal;
import java.util.List;

public record SecondHandProfileDto(
    List<String> categories,
    List<String> brands,
    BudgetDto budget
) {
    public record BudgetDto(
        BigDecimal min,
        BigDecimal max,
        String currency
    ) {}
}
