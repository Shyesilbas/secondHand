package com.serhat.secondhand.core.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Test controller for rate limiting functionality
 * Only available when rate limiting is enabled
 */
@RestController
@RequestMapping("/api/test/rate-limit")
@ConditionalOnProperty(name = "app.rate-limit.enabled", havingValue = "true")
@Slf4j
public class RateLimitTestController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> testAuthRateLimit(HttpServletRequest request) {
        return createTestResponse("auth", request);
    }

    @GetMapping("/payment")
    public ResponseEntity<Map<String, Object>> testPaymentRateLimit(HttpServletRequest request) {
        return createTestResponse("payment", request);
    }

    @GetMapping("/general")
    public ResponseEntity<Map<String, Object>> testGeneralRateLimit(HttpServletRequest request) {
        return createTestResponse("general", request);
    }

    @PostMapping("/auth/burst")
    public ResponseEntity<Map<String, Object>> testAuthBurst(HttpServletRequest request) {
        return createTestResponse("auth-burst", request);
    }

    @PostMapping("/payment/burst")
    public ResponseEntity<Map<String, Object>> testPaymentBurst(HttpServletRequest request) {
        return createTestResponse("payment-burst", request);
    }

    private ResponseEntity<Map<String, Object>> createTestResponse(String endpoint, HttpServletRequest request) {
        String clientIp = getClientIp(request);
        
        Map<String, Object> response = Map.of(
            "timestamp", LocalDateTime.now(),
            "endpoint", endpoint,
            "clientIp", clientIp,
            "message", "Rate limit test successful",
            "rateLimitHeaders", Map.of(
                "X-RateLimit-Limit", request.getHeader("X-RateLimit-Limit"),
                "X-RateLimit-Remaining", request.getHeader("X-RateLimit-Remaining"),
                "X-RateLimit-Reset", request.getHeader("X-RateLimit-Reset")
            )
        );
        
        log.info("Rate limit test - Endpoint: {}, IP: {}", endpoint, clientIp);
        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
