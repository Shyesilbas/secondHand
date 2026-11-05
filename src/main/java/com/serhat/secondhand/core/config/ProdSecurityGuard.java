package com.serhat.secondhand.core.config;

import jakarta.annotation.PostConstruct;
import io.jsonwebtoken.io.Decoders;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProdSecurityGuard {

    private final JwtConfig jwtConfig;
    private final CookieConfig cookieConfig;
    private final CorsConfigProperties corsConfigProperties;
    private final RateLimitConfig rateLimitConfig;
    private final Environment environment;

    /** Actuator endpoints that expose configuration, memory or control and must never be on the web in prod. */
    private static final Set<String> SENSITIVE_ACTUATOR_ENDPOINTS = Set.of(
            "*", "env", "configprops", "beans", "heapdump", "threaddump", "loggers", "mappings", "shutdown", "logfile");

    @PostConstruct
    void validate() {
        List<String> errors = new ArrayList<>();

        String secret = jwtConfig.getSecretKey();
        if (secret == null || secret.isBlank()) {
            errors.add("jwt.secretKey must be configured in prod profile.");
        } else {
            // The key is base64; HS256 needs at least 256 bits of decoded key material.
            try {
                if (Decoders.BASE64.decode(secret).length < 32) {
                    errors.add("jwt.secretKey must decode to at least 32 bytes in prod profile.");
                }
            } catch (RuntimeException e) {
                errors.add("jwt.secretKey must be valid base64 in prod profile.");
            }
        }

        if (!rateLimitConfig.isEnabled()) {
            errors.add("app.rate-limit.enabled must be true in prod profile.");
        }

        String exposed = environment.getProperty("management.endpoints.web.exposure.include", "");
        Arrays.stream(exposed.split(","))
                .map(e -> e.trim().toLowerCase(Locale.ROOT))
                .filter(SENSITIVE_ACTUATOR_ENDPOINTS::contains)
                .findFirst()
                .ifPresent(e -> errors.add("management.endpoints.web.exposure.include must not expose '" + e + "' in prod profile."));

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

