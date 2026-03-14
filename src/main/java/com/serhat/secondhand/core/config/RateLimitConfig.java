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
    private Auth auth = new Auth();
    private Payment payment = new Payment();
    private General general = new General();
    private Ai ai = new Ai();
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

    @Getter
    @Setter
    public static class Ai {
        private int requestsPerSecond = 6;
    }
}

