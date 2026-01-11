package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.rate-limit")
@Getter
@Setter
public class RateLimitConfig {
    private boolean enabled = true;
    private Auth auth;
    private Payment payment;
    private General general;
    private int windowSizeSeconds = 60;

    @Getter
    @Setter
    public static class Auth {
        private int requestsPerSecond = 3;
    }

    @Getter
    @Setter
    public static class Payment {
        private int requestsPerSecond = 3;
    }

    @Getter
    @Setter
    public static class General {
        private int requestsPerSecond = 10;
    }
}

