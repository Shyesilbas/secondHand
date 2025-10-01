package com.serhat.secondhand.exchange;

public record ExchangeRateResponse(
        String result,
        String base_code,
        String target_code,
        Double conversion_rate
) {
}
