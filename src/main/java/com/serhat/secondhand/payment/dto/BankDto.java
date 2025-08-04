package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;

public record BankDto(
        String IBAN,
        BigDecimal balance,
        String holderName,
        String holderSurname
) {
}
