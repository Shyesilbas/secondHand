package com.serhat.secondhand.exchange;

public record ExchangeRateDto(
        String from,
        String to,
        Double rate
) {
}
