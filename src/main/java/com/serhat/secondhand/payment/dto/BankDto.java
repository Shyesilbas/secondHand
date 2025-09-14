package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BankDto(
        UUID id,
        String IBAN,
        BigDecimal balance,
        String holderName,
        String holderSurname
) {
}
