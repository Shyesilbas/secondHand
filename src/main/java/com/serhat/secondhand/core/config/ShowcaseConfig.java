package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "app.showcase")
@Getter
@Setter
public class ShowcaseConfig {
    private Daily daily;
    private Fee fee;

    @Getter
    @Setter
    public static class Daily {
        private BigDecimal cost;
    }

    @Getter
    @Setter
    public static class Fee {
        private BigDecimal tax;
    }
}

