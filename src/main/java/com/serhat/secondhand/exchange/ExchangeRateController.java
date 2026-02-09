package com.serhat.secondhand.exchange;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/exchange")
public class ExchangeRateController {
    private final ExchangeRateService exchangeRateService;

    @GetMapping("/{from}/{to}")
    public ExchangeRateDto getExchangeRate(
            @PathVariable String from,
            @PathVariable String to
    ) {
        return exchangeRateService.getRate(from, to);
    }
}
