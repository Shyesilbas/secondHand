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
    /** Hours the buyer has to pay after the seller accepts; an unpaid accepted offer then expires. */
    private int acceptedPaymentHours = 24;
    private String schedulerCron = "0 * * * * *";

    public LocalDateTime calculateExpiresAt() {
        return LocalDateTime.now().plusHours(expirationHours);
    }

    public LocalDateTime calculatePaymentDeadline() {
        return LocalDateTime.now().plusHours(acceptedPaymentHours);
    }
}
