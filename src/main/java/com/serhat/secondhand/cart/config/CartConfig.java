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

    @Getter
    @Setter
    public static class Reservation {
        private Integer timeoutMinutes = 15;
        private boolean enabled = true;

        public Duration getTimeoutDuration() {
            return Duration.ofMinutes(timeoutMinutes != null ? timeoutMinutes : 15);
        }
    }
}
