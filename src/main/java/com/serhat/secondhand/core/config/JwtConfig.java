package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtConfig {
    private String secretKey;
    private AccessToken accessToken;
    private RefreshToken refreshToken;

    @Getter
    @Setter
    public static class AccessToken {
        private long expiration;
    }

    @Getter
    @Setter
    public static class RefreshToken {
        private long expiration;
    }
}

