package com.serhat.secondhand.core.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Rate Limiting Filter to prevent abuse and DDoS attacks
 * Implements sliding window rate limiting per IP address
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1) // Right after SecurityHeadersFilter
@Slf4j
public class RateLimitingFilter implements Filter {

    // Rate limiting configurations
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

    // In-memory storage for rate limiting
    private final ConcurrentHashMap<String, RateLimitData> rateLimitMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("RateLimitingFilter initialized - Auth: {}/s, Payment: {}/s, General: {}/s", 
                authRequestsPerSecond, paymentRequestsPerSecond, generalRequestsPerSecond);
        
        // Schedule cleanup task to remove old entries
        cleanupExecutor.scheduleAtFixedRate(this::cleanupOldEntries, 60, 60, TimeUnit.SECONDS);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!rateLimitingEnabled) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIpAddress(httpRequest);
        String requestURI = httpRequest.getRequestURI();
        
        // Determine rate limit based on endpoint
        int requestsPerSecond = determineRateLimit(requestURI);
        int maxRequestsPerWindow = requestsPerSecond * windowSizeSeconds;

        String rateLimitKey = clientIp + ":" + getRateLimitCategory(requestURI);
        
        // Check and update rate limit
        if (isRateLimited(rateLimitKey, maxRequestsPerWindow)) {
            handleRateLimitExceeded(httpResponse, clientIp, requestURI, requestsPerSecond);
            return;
        }

        // Add rate limit headers
        addRateLimitHeaders(httpResponse, rateLimitKey, maxRequestsPerWindow, requestsPerSecond);

        chain.doFilter(request, response);
    }

    /**
     * Determines rate limit based on request URI
     */
    private int determineRateLimit(String requestURI) {
        if (requestURI.startsWith("/api/auth/")) {
            return authRequestsPerSecond;
        } else if (requestURI.startsWith("/api/payment/") || requestURI.contains("payment")) {
            return paymentRequestsPerSecond;
        } else {
            return generalRequestsPerSecond;
        }
    }

    /**
     * Gets rate limit category for grouping requests
     */
    private String getRateLimitCategory(String requestURI) {
        if (requestURI.startsWith("/api/auth/")) {
            return "auth";
        } else if (requestURI.startsWith("/api/payment/") || requestURI.contains("payment")) {
            return "payment";
        } else {
            return "general";
        }
    }

    /**
     * Checks if request should be rate limited
     */
    private boolean isRateLimited(String key, int maxRequestsPerWindow) {
        LocalDateTime now = LocalDateTime.now();
        
        RateLimitData rateLimitData = rateLimitMap.computeIfAbsent(key, k -> new RateLimitData());
        
        synchronized (rateLimitData) {
            // Remove requests outside the time window
            rateLimitData.requests.removeIf(timestamp -> 
                ChronoUnit.SECONDS.between(timestamp, now) >= windowSizeSeconds);
            
            // Check if limit is exceeded
            if (rateLimitData.requests.size() >= maxRequestsPerWindow) {
                rateLimitData.lastRateLimitTime = now;
                return true;
            }
            
            // Add current request
            rateLimitData.requests.add(now);
            return false;
        }
    }

    /**
     * Handles rate limit exceeded scenario
     */
    private void handleRateLimitExceeded(HttpServletResponse response, String clientIp, 
                                       String requestURI, int requestsPerSecond) throws IOException {
        response.setStatus(429); // HTTP 429 Too Many Requests
        response.setContentType("application/json;charset=UTF-8");
        
        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerSecond));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + (windowSizeSeconds * 1000)));
        response.setHeader("Retry-After", String.valueOf(windowSizeSeconds));
        
        String errorResponse = String.format(
                """
                {
                    "timestamp": "%s",
                    "status": 429,
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Maximum %d requests per second allowed.",
                    "path": "%s",
                    "retryAfter": %d
                }
                """,
                LocalDateTime.now(),
                requestsPerSecond,
                requestURI,
                windowSizeSeconds
        );
        
        response.getWriter().write(errorResponse);
        
        log.warn("Rate limit exceeded for IP: {}, URI: {}, Limit: {}/s", 
                clientIp, requestURI, requestsPerSecond);
    }

    /**
     * Adds rate limit headers to response
     */
    private void addRateLimitHeaders(HttpServletResponse response, String key, 
                                   int maxRequestsPerWindow, int requestsPerSecond) {
        RateLimitData rateLimitData = rateLimitMap.get(key);
        if (rateLimitData != null) {
            synchronized (rateLimitData) {
                int remaining = Math.max(0, maxRequestsPerWindow - rateLimitData.requests.size());
                long resetTime = System.currentTimeMillis() + (windowSizeSeconds * 1000);
                
                response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerSecond));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
                response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime));
            }
        }
    }

    /**
     * Gets client IP address considering proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Cleanup old entries to prevent memory leaks
     */
    private void cleanupOldEntries() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(windowSizeSeconds * 2);
        
        rateLimitMap.entrySet().removeIf(entry -> {
            RateLimitData data = entry.getValue();
            synchronized (data) {
                // Remove if no recent requests and no recent rate limits
                return data.requests.isEmpty() && 
                       (data.lastRateLimitTime == null || data.lastRateLimitTime.isBefore(cutoff));
            }
        });
        
        log.debug("Rate limit cleanup completed. Active entries: {}", rateLimitMap.size());
    }

    @Override
    public void destroy() {
        cleanupExecutor.shutdown();
        log.info("RateLimitingFilter destroyed");
    }

    /**
     * Rate limit data structure
     */
    private static class RateLimitData {
        private final java.util.List<LocalDateTime> requests = new java.util.ArrayList<>();
        private LocalDateTime lastRateLimitTime;
    }
}
