package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfigProperties {

    private String frontendUrl;

    private EWallet eWallet = new EWallet();
    private Membership membership = new Membership();

    @Getter
    @Setter
    public static class EWallet {
        private BigDecimal defaultBalance = new BigDecimal("10000.00");
        private BigDecimal spendingWarningThreshold = new BigDecimal("0.90");
    }

    @Getter
    @Setter
    public static class Membership {
        private BigDecimal premiumPrice = new BigDecimal("100.00");
        private int premiumDurationDays = 30;
    }
}
