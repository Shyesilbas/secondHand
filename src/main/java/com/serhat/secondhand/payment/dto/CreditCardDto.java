package com.serhat.secondhand.payment.dto;

public record CreditCardDto(
        String number,
        String cvv,
        String expiryMonth,
        String expiryYear,
        String amount,
        String limit
) {
}
