package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.RateLimitConfig;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.lang.NonNull;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Per-IP, per-category request limit. Counters live in Redis (fixed window), so
 * every instance shares them.
 * If Redis cannot be reached the request is rejected with 503 instead of
 * passing unlimited.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final String KEY_PREFIX = "ratelimit:";

    private final RateLimitConfig rateLimitConfig;
    private final ClientIpResolver clientIpResolver;
    private final StringRedisTemplate redisTemplate;

    private DefaultRedisScript<Long> windowScript;

    @PostConstruct
    public void init() {
        windowScript = new DefaultRedisScript<>();
        windowScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/rate_limit_window.lua")));
        windowScript.setResultType(Long.class);

        log.info(
                "RateLimitingFilter initialized - Enabled: {}, Auth: {}/{}s, Payment: {}/{}s, AI: {}/{}s, General: {}/{}s",
                rateLimitConfig.isEnabled(),
                Category.AUTH.resolveLimit(rateLimitConfig), rateLimitConfig.getWindowSizeSeconds(),
                Category.PAYMENT.resolveLimit(rateLimitConfig), rateLimitConfig.getWindowSizeSeconds(),
                Category.AI.resolveLimit(rateLimitConfig), rateLimitConfig.getWindowSizeSeconds(),
                Category.GENERAL.resolveLimit(rateLimitConfig), rateLimitConfig.getWindowSizeSeconds());
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        if (!rateLimitConfig.isEnabled()) {
            return true;
        }

        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        String uri = request.getRequestURI();
        return uri.startsWith("/swagger-ui") ||
                uri.startsWith("/api-docs") ||
                uri.startsWith("/v3/api-docs") ||
                uri.startsWith("/ws/") ||
                uri.startsWith("/actuator/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = clientIpResolver.resolve(request);
        String requestURI = request.getRequestURI();
        Category category = categorize(requestURI);

        int windowSeconds = rateLimitConfig.getWindowSizeSeconds();
        int maxRequestsPerWindow = category.resolveLimit(rateLimitConfig);

        long windowMillis = windowSeconds * 1000L;
        long now = System.currentTimeMillis();
        long windowIndex = now / windowMillis;
        long resetAt = (windowIndex + 1) * windowMillis;
        String key = KEY_PREFIX + category.name + ":" + clientIp + ":" + windowIndex;

        long count;
        try {
            Long result = redisTemplate.execute(windowScript, List.of(key), String.valueOf(windowMillis));
            if (result == null) {
                throw new IllegalStateException("Rate limit script returned no count");
            }
            count = result;
        } catch (DataAccessException | IllegalStateException e) {
            log.error("Rate limiter unavailable, rejecting request - URI: {}, error: {}", requestURI, e.getMessage());
            writeError(response, 503, "Service Unavailable", "Rate limiter is unavailable. Please retry shortly.",
                    requestURI, null);
            return;
        }

        if (count > maxRequestsPerWindow) {
            long retryAfterSeconds = Math.max(1, (resetAt - now + 999) / 1000);
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequestsPerWindow));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(resetAt));
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            writeError(response, 429, "Too Many Requests",
                    String.format(
                            "Rate limit exceeded. Maximum %d requests per %d seconds allowed for this endpoint type.",
                            maxRequestsPerWindow, windowSeconds),
                    requestURI, retryAfterSeconds);
            log.warn("Rate limit exceeded - IP: {}, URI: {}, Limit: {}/{}s", clientIp, requestURI, maxRequestsPerWindow,
                    windowSeconds);
            return;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequestsPerWindow));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxRequestsPerWindow - count)));
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetAt));
        filterChain.doFilter(request, response);
    }

    static Category categorize(String uri) {
        if (uri.startsWith("/api/auth/") || uri.startsWith("/api/v1/auth/")) {
            return Category.AUTH;
        }
        if (uri.startsWith("/api/ai/") || uri.startsWith("/api/v1/ai/")) {
            return Category.AI;
        }
        if (isUnder(uri, "/api/payment") || isUnder(uri, "/api/v1/payments")
                || isUnder(uri, "/api/v1/test/rate-limits/payment")) {
            return Category.PAYMENT;
        }
        return Category.GENERAL;
    }

    private static boolean isUnder(String uri, String prefix) {
        return uri.equals(prefix) || uri.startsWith(prefix + "/");
    }

    private void writeError(HttpServletResponse response, int status, String error, String message,
            String path, Long retryAfterSeconds) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        String retry = retryAfterSeconds == null ? "" : ",\n    \"retryAfter\": " + retryAfterSeconds;
        response.getWriter().write(String.format(
                "{\n    \"timestamp\": \"%s\",\n    \"status\": %d,\n    \"error\": \"%s\",\n    \"message\": \"%s\",\n    \"path\": \"%s\"%s\n}\n",
                LocalDateTime.now(), status, error, message, jsonEscape(path), retry));
    }

    private static String jsonEscape(String value) {
        StringBuilder sb = new StringBuilder(value.length());
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.toString();
    }

    enum Category {
        AUTH("auth"), AI("ai"), PAYMENT("payment"), GENERAL("general");

        final String name;

        Category(String name) {
            this.name = name;
        }

        int resolveLimit(RateLimitConfig config) {
            int window = config.getWindowSizeSeconds();
            return switch (this) {
                case AUTH -> config.getAuth().resolveLimit(window, 20);
                case AI -> config.getAi().resolveLimit(window, 15);
                case PAYMENT -> config.getPayment().resolveLimit(window, 10);
                case GENERAL -> config.getGeneral().resolveLimit(window, 150);
            };
        }

        int requestsPerSecond(RateLimitConfig config) {
            return resolveLimit(config);
        }
    }
}
