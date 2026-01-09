package com.serhat.secondhand.core.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test/rate-limit")
@ConditionalOnProperty(name = "app.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class RateLimitTestController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> testAuthRateLimit(HttpServletRequest request, HttpServletResponse response) {
        return createTestResponse("auth", request, response);
    }

    @GetMapping("/payment")
    public ResponseEntity<Map<String, Object>> testPaymentRateLimit(HttpServletRequest request, HttpServletResponse response) {
        return createTestResponse("payment", request, response);
    }

    @GetMapping("/general")
    public ResponseEntity<Map<String, Object>> testGeneralRateLimit(HttpServletRequest request, HttpServletResponse response) {
        return createTestResponse("general", request, response);
    }

    @PostMapping("/auth/burst")
    public ResponseEntity<Map<String, Object>> testAuthBurst(HttpServletRequest request, HttpServletResponse response) {
        return createTestResponse("auth-burst", request, response);
    }

    @PostMapping("/payment/burst")
    public ResponseEntity<Map<String, Object>> testPaymentBurst(HttpServletRequest request, HttpServletResponse response) {
        return createTestResponse("payment-burst", request, response);
    }

    private ResponseEntity<Map<String, Object>> createTestResponse(String endpoint, HttpServletRequest request, HttpServletResponse response) {
        String clientIp = getClientIp(request);

        Map<String, Object> rateLimitHeaders = new HashMap<>();
        rateLimitHeaders.put("X-RateLimit-Limit", response.getHeader("X-RateLimit-Limit"));
        rateLimitHeaders.put("X-RateLimit-Remaining", response.getHeader("X-RateLimit-Remaining"));
        rateLimitHeaders.put("X-RateLimit-Reset", response.getHeader("X-RateLimit-Reset"));

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("timestamp", LocalDateTime.now().toString());
        responseBody.put("endpoint", endpoint);
        responseBody.put("clientIp", clientIp);
        responseBody.put("message", "Rate limit test successful");
        responseBody.put("rateLimitHeaders", rateLimitHeaders);

        log.info("Rate limit test - Endpoint: {}, IP: {}, Remaining: {}", 
                endpoint, clientIp, response.getHeader("X-RateLimit-Remaining"));
        return ResponseEntity.ok(responseBody);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
