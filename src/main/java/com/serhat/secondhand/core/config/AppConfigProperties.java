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

    @Getter
    @Setter
    public static class EWallet {
        private BigDecimal defaultBalance = new BigDecimal("10000.00");
        private BigDecimal spendingWarningThreshold = new BigDecimal("0.90");
    }
}
