package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;

public record CreditCardRequest(
    BigDecimal limit
) {
}