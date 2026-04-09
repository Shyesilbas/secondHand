package com.serhat.secondhand.payment.dto;

import java.util.UUID;

public record CreditCardDto(
        UUID id,
        String cardLabel,
        String number,
        String cvv,
        String expiryMonth,
        String expiryYear,
        String amount,
        String limit,
        String totalSpent,
        String limitLeft
) {
}
