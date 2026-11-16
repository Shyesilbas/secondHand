package com.serhat.secondhand.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record SecondHandProfileDto(
    @Size(max = 10, message = "Categories must contain at most 10 items")
    List<@Size(max = 40, message = "Each category must be at most 40 characters") String> categories,
    @Size(max = 20, message = "Brands must contain at most 20 items")
    List<@Size(max = 40, message = "Each brand must be at most 40 characters") String> brands,
    @Valid
    BudgetDto budget
) {
    public record BudgetDto(
        BigDecimal min,
        BigDecimal max,
        @Size(max = 10, message = "Currency must be at most 10 characters")
        String currency
    ) {}
}
