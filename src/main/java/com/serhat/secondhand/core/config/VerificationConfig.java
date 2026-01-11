package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.verification.code")
@Getter
@Setter
public class VerificationConfig {
    private int expiryMinutes = 3;
}

