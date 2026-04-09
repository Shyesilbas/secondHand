package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;

/**
 * cardNumber / cvv / expiryMonth / expiryYear opsiyonel.
 * Boş bırakılırsa sistem otomatik üretir (mock mod).
 */
public record CreditCardRequest(
    BigDecimal limit,
    String cardLabel,
    String cardNumber,
    String cvv,
    Integer expiryMonth,
    Integer expiryYear
) {
    public boolean isManual() {
        return cardNumber != null && !cardNumber.isBlank();
    }
}