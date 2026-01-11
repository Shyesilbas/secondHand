package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.async")
@Getter
@Setter
public class AsyncConfigProperties {
    private int corePoolSize = 4;
    private int maxPoolSize = 10;
    private int queueCapacity = 100;
    private String threadNamePrefix = "async-";
}

