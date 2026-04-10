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
    private Scheduler scheduler = new Scheduler();
    private Integer maxDays = 30;
    private Integer activeListDefaultSize = 12;

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

    @Getter
    @Setter
    public static class Scheduler {
        private String expireCron = "0 0 * * * ?";
    }
}

