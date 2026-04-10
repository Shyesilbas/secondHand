package com.serhat.secondhand.offer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
@ConfigurationProperties(prefix = "app.offer")
@Getter
@Setter
public class OfferConfigProperties {

    private int expirationHours = 24;
    private String schedulerCron = "0 * * * * *";

    public LocalDateTime calculateExpiresAt() {
        return LocalDateTime.now().plusHours(expirationHours);
    }
}
