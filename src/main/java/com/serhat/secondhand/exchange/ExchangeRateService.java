package com.serhat.secondhand.exchange;

import com.serhat.secondhand.core.config.ExchangeConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeConfig exchangeConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_URL = "https://v6.exchangerate-api.com/v6/{apiKey}/pair/{base}/{target}";

    public ExchangeRateDto getRate(String from, String to) {
        validateCurrencies(from, to);
        
        String url = API_URL
                .replace("{apiKey}", exchangeConfig.getKey())
                .replace("{base}", from)
                .replace("{target}", to);

        log.info("Fetching exchange rate from API: {} -> {}", from, to);

        try {
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);

            if (response == null || !"success".equalsIgnoreCase(response.result())) {
                log.error("Exchange API returned unsuccessful response for {} -> {}: {}", from, to, 
                        response != null ? response.result() : "null response");
                throw new IllegalStateException("Exchange API failed for " + from + " → " + to);
            }

            log.info("Successfully fetched exchange rate: {} -> {} = {}", from, to, response.conversion_rate());
            return new ExchangeRateDto(from, to, response.conversion_rate());
            
        } catch (ResourceAccessException e) {
            log.error("Network error while fetching exchange rate for {} -> {}: {}", from, to, e.getMessage(), e);
            throw new BusinessException("Failed to connect to exchange rate service. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE, "EXCHANGE_SERVICE_UNAVAILABLE");

        } catch (RestClientException e) {

            log.error("HTTP error while fetching exchange rate for {} -> {}: {}", from, to, e.getMessage(), e);
            throw new BusinessException("Exchange rate service returned an error. Please try again later.", HttpStatus.BAD_GATEWAY, "EXCHANGE_SERVICE_ERROR");

        } catch (Exception e) {
            log.error("Unexpected error while fetching exchange rate for {} -> {}: {}", from, to, e.getMessage(), e);
            throw new BusinessException("An unexpected error occurred while fetching exchange rate.", HttpStatus.INTERNAL_SERVER_ERROR, "EXCHANGE_UNEXPECTED_ERROR");
        }
    }

    private void validateCurrencies(String from, String to) {
        if (!isSupported(from) || !isSupported(to)) {
            throw new IllegalArgumentException("Only USD, EUR and TRY currencies are supported.");
        }
    }

    private boolean isSupported(String currency) {
        return "USD".equalsIgnoreCase(currency)
                || "EUR".equalsIgnoreCase(currency)
                || "TRY".equalsIgnoreCase(currency);
    }
}
