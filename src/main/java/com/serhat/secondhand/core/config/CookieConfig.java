package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.auth.cookie")
@Getter
@Setter
public class CookieConfig {
    private String domain = "localhost";
    private boolean secure = false;
    private String sameSite = "Lax";
}

