package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

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
    private boolean trustForwardedHeaders = true;
    /** Direct peers (CIDR) whose X-Forwarded-For / X-Real-IP headers are believed: loopback and private ranges. */
    private List<String> trustedProxies = new ArrayList<>(List.of(
            "127.0.0.0/8", "::1/128", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7"));

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
