package com.serhat.secondhand.cart.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@ConfigurationProperties(prefix = "app.cart")
@Getter
@Setter
public class CartConfig {
    private Reservation reservation = new Reservation();
    private Defaults defaults = new Defaults();
    private Scheduler scheduler = new Scheduler();
    private String zoneId = "Europe/Istanbul";

    @Getter
    @Setter
    public static class Reservation {
        private Integer timeoutMinutes = 15;
        private boolean enabled = true;
        private Integer threshold = 3;

        public Duration getTimeoutDuration() {
            return Duration.ofMinutes(timeoutMinutes != null ? timeoutMinutes : 15);
        }
    }

    @Getter
    @Setter
    public static class Defaults {
        private Integer quantity = 1;
    }

    @Getter
    @Setter
    public static class Scheduler {
        private Long cleanupFixedRateMs = 60000L;
    }
}
