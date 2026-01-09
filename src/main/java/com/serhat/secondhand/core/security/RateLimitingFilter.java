package com.serhat.secondhand.core.security;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${app.rate-limit.auth.requests-per-second:3}")
    private int authRequestsPerSecond;

    @Value("${app.rate-limit.payment.requests-per-second:3}")
    private int paymentRequestsPerSecond;

    @Value("${app.rate-limit.general.requests-per-second:10}")
    private int generalRequestsPerSecond;

    @Value("${app.rate-limit.window-size-seconds:60}")
    private int windowSizeSeconds;

    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitingEnabled;

    private final ConcurrentHashMap<String, RateLimitData> rateLimitMap = new ConcurrentHashMap<>();
    private ScheduledExecutorService cleanupExecutor;

    @PostConstruct
    public void init() {
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleanup");
            t.setDaemon(true);
            return t;
        });
        cleanupExecutor.scheduleAtFixedRate(this::cleanupOldEntries, 60, 60, TimeUnit.SECONDS);
        
        log.info("RateLimitingFilter initialized - Enabled: {}, Auth: {}/s, Payment: {}/s, General: {}/s, Window: {}s",
                rateLimitingEnabled, authRequestsPerSecond, paymentRequestsPerSecond, generalRequestsPerSecond, windowSizeSeconds);
    }

    @PreDestroy
    public void destroy() {
        if (cleanupExecutor != null && !cleanupExecutor.isShutdown()) {
            cleanupExecutor.shutdown();
            try {
                if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    cleanupExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                cleanupExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        log.info("RateLimitingFilter destroyed");
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        if (!rateLimitingEnabled) {
            return true;
        }
        
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        
        String uri = request.getRequestURI();
        if (uri.startsWith("/swagger-ui") || 
            uri.startsWith("/api-docs") || 
            uri.startsWith("/v3/api-docs") ||
            uri.startsWith("/ws/")) {
            return true;
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIpAddress(request);
        String requestURI = request.getRequestURI();

        int requestsPerSecond = determineRateLimit(requestURI);
        int maxRequestsPerWindow = requestsPerSecond * windowSizeSeconds;

        String rateLimitKey = clientIp + ":" + getRateLimitCategory(requestURI);

        if (isRateLimited(rateLimitKey, maxRequestsPerWindow)) {
            handleRateLimitExceeded(response, clientIp, requestURI, requestsPerSecond);
            return;
        }

        addRateLimitHeaders(response, rateLimitKey, maxRequestsPerWindow, requestsPerSecond);
        filterChain.doFilter(request, response);
    }

    private int determineRateLimit(String requestURI) {
        if (requestURI.startsWith("/api/auth/")) {
            return authRequestsPerSecond;
        } else if (requestURI.startsWith("/api/payment/") || 
                   requestURI.startsWith("/api/v1/payments/") || 
                   requestURI.contains("payment")) {
            return paymentRequestsPerSecond;
        } else {
            return generalRequestsPerSecond;
        }
    }

    private String getRateLimitCategory(String requestURI) {
        if (requestURI.startsWith("/api/auth/")) {
            return "auth";
        } else if (requestURI.startsWith("/api/payment/") || 
                   requestURI.startsWith("/api/v1/payments/") || 
                   requestURI.contains("payment")) {
            return "payment";
        } else {
            return "general";
        }
    }

    private boolean isRateLimited(String key, int maxRequestsPerWindow) {
        LocalDateTime now = LocalDateTime.now();
        
        RateLimitData rateLimitData = rateLimitMap.computeIfAbsent(key, k -> new RateLimitData());

        synchronized (rateLimitData) {
            rateLimitData.requests.removeIf(timestamp ->
                    ChronoUnit.SECONDS.between(timestamp, now) >= windowSizeSeconds);

            if (rateLimitData.requests.size() >= maxRequestsPerWindow) {
                rateLimitData.lastRateLimitTime = now;
                log.debug("Rate limit check - Key: {}, Requests: {}, Max: {}, BLOCKED", 
                        key, rateLimitData.requests.size(), maxRequestsPerWindow);
                return true;
            }

            rateLimitData.requests.add(now);
            log.trace("Rate limit check - Key: {}, Requests: {}, Max: {}, ALLOWED", 
                    key, rateLimitData.requests.size(), maxRequestsPerWindow);
            return false;
        }
    }

    private void handleRateLimitExceeded(HttpServletResponse response, String clientIp,
                                         String requestURI, int requestsPerSecond) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");

        response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerSecond * windowSizeSeconds));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + (windowSizeSeconds * 1000L)));
        response.setHeader("Retry-After", String.valueOf(windowSizeSeconds));

        String errorResponse = String.format(
                """
                {
                    "timestamp": "%s",
                    "status": 429,
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Maximum %d requests per %d seconds allowed for this endpoint type.",
                    "path": "%s",
                    "retryAfter": %d
                }
                """,
                LocalDateTime.now(),
                requestsPerSecond * windowSizeSeconds,
                windowSizeSeconds,
                requestURI,
                windowSizeSeconds
        );

        response.getWriter().write(errorResponse);
        log.warn("Rate limit exceeded - IP: {}, URI: {}, Limit: {}/{}s",
                clientIp, requestURI, requestsPerSecond * windowSizeSeconds, windowSizeSeconds);
    }

    private void addRateLimitHeaders(HttpServletResponse response, String key,
                                     int maxRequestsPerWindow, int requestsPerSecond) {
        RateLimitData rateLimitData = rateLimitMap.get(key);
        if (rateLimitData != null) {
            synchronized (rateLimitData) {
                int remaining = Math.max(0, maxRequestsPerWindow - rateLimitData.requests.size());
                long resetTime = System.currentTimeMillis() + (windowSizeSeconds * 1000L);

                response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequestsPerWindow));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
                response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime));
            }
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        String proxyClientIp = request.getHeader("Proxy-Client-IP");
        if (proxyClientIp != null && !proxyClientIp.isEmpty() && !"unknown".equalsIgnoreCase(proxyClientIp)) {
            return proxyClientIp;
        }

        return request.getRemoteAddr();
    }

    private void cleanupOldEntries() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(windowSizeSeconds * 2L);
        int removedCount = 0;

        var iterator = rateLimitMap.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            RateLimitData data = entry.getValue();
            synchronized (data) {
                data.requests.removeIf(timestamp ->
                        ChronoUnit.SECONDS.between(timestamp, LocalDateTime.now()) >= windowSizeSeconds);
                
                if (data.requests.isEmpty() &&
                        (data.lastRateLimitTime == null || data.lastRateLimitTime.isBefore(cutoff))) {
                    iterator.remove();
                    removedCount++;
                }
            }
        }

        if (removedCount > 0 || !rateLimitMap.isEmpty()) {
            log.debug("Rate limit cleanup - Removed: {}, Active entries: {}", removedCount, rateLimitMap.size());
        }
    }

    private static class RateLimitData {
        final List<LocalDateTime> requests = new ArrayList<>();
        LocalDateTime lastRateLimitTime;
    }
}
