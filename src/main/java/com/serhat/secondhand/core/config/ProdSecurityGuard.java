package com.serhat.secondhand.core.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProdSecurityGuard {

    private final JwtConfig jwtConfig;
    private final CookieConfig cookieConfig;
    private final CorsConfigProperties corsConfigProperties;

    @PostConstruct
    void validate() {
        List<String> errors = new ArrayList<>();

        String secret = jwtConfig.getSecretKey();
        if (secret == null || secret.isBlank()) {
            errors.add("jwt.secretKey must be configured in prod profile.");
        } else if (secret.length() < 32) {
            errors.add("jwt.secretKey must be at least 32 characters in prod profile.");
        }

        if (!cookieConfig.isSecure()) {
            errors.add("app.auth.cookie.secure must be true in prod profile.");
        }

        if (cookieConfig.getSameSite() == null || cookieConfig.getSameSite().isBlank()) {
            errors.add("app.auth.cookie.same-site must be configured in prod profile.");
        }

        List<String> origins = corsConfigProperties.getAllowedOrigins();
        if (origins == null || origins.isEmpty()) {
            errors.add("app.cors.allowed-origins must not be empty in prod profile.");
        } else {
            for (String origin : origins) {
                String normalized = origin == null ? "" : origin.toLowerCase();
                if (normalized.contains("localhost") || normalized.contains("127.0.0.1")) {
                    errors.add("app.cors.allowed-origins must not include localhost values in prod profile.");
                    break;
                }
                if (corsConfigProperties.isAllowCredentials() && normalized.contains("*")) {
                    errors.add("Wildcard CORS origin is not allowed when allow-credentials=true.");
                    break;
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new IllegalStateException("Prod security guard failed: " + String.join(" | ", errors));
        }
    }
}

