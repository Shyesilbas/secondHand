package com.serhat.secondhand.user.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BankAccountDto(
    String iban,
    BigDecimal balance,
    LocalDateTime createdAt
) {
}