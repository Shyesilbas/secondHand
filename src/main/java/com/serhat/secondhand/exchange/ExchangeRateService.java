package com.serhat.secondhand.exchange;

import com.serhat.secondhand.core.config.ExchangeConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeConfig exchangeConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_URL = "https://v6.exchangerate-api.com/v6/{apiKey}/pair/{base}/{target}";

    public ExchangeRateDto getRate(String from, String to) {
        String url = API_URL
                .replace("{apiKey}", exchangeConfig.getKey())
                .replace("{base}", from)
                .replace("{target}", to);

        log.info("Fetching exchange rate from API: {} -> {}", from, to);

        ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);

        if (response == null || !"success".equalsIgnoreCase(response.result())) {
            throw new IllegalStateException("Exchange API failed for " + from + " → " + to);
        }

        return new ExchangeRateDto(from, to, response.conversion_rate());
    }
}
