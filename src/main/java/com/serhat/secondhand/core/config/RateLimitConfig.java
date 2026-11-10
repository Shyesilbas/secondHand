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
    private Limit auth = new Limit(20);
    private Limit payment = new Limit(10);
    private Limit general = new Limit(150);
    private Limit ai = new Limit(15);
    private int windowSizeSeconds = 60;
    private boolean trustForwardedHeaders = true;
    /** Direct peers (CIDR) whose X-Forwarded-For / X-Real-IP headers are believed: loopback and private ranges. */
    private List<String> trustedProxies = new ArrayList<>(List.of(
            "127.0.0.0/8", "::1/128", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7"));

    @Getter
    @Setter
    public static class Limit {
        /** Explicit request limit per window (e.g. 10 requests per 60s). */
        private Integer limit;
        /** Optional legacy / fallback: requests per second. */
        private Integer requestsPerSecond;

        public Limit() {
        }

        public Limit(int defaultLimit) {
            this.limit = defaultLimit;
        }

        public int resolveLimit(int windowSeconds, int defaultLimit) {
            if (limit != null && limit > 0) {
                return limit;
            }
            if (requestsPerSecond != null && requestsPerSecond > 0) {
                return requestsPerSecond * windowSeconds;
            }
            return defaultLimit;
        }

        public int getRequestsPerSecond() {
            if (requestsPerSecond != null && requestsPerSecond > 0) {
                return requestsPerSecond;
            }
            return limit != null ? limit : 0;
        }
    }
}
