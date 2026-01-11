package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "app.listing")
@Getter
@Setter
public class ListingConfig {
    private Creation creation;
    private Fee fee;

    @Getter
    @Setter
    public static class Creation {
        private BigDecimal fee;
    }

    @Getter
    @Setter
    public static class Fee {
        private BigDecimal tax;
    }
}

