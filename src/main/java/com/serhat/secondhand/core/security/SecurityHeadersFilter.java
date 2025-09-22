package com.serhat.secondhand.core.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Security Headers Filter to add essential security headers to all HTTP responses
 * This filter adds protection against various web vulnerabilities
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // X-Content-Type-Options: Prevents MIME type sniffing attacks
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // X-Frame-Options: Prevents clickjacking attacks
        httpResponse.setHeader("X-Frame-Options", "DENY");

        // X-XSS-Protection: Enables XSS filtering in browsers
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

        // Strict-Transport-Security: Enforces HTTPS connections
        if (httpRequest.isSecure()) {
            httpResponse.setHeader("Strict-Transport-Security", 
                "max-age=31536000; includeSubDomains; preload");
        }

        // Content-Security-Policy: Prevents various injection attacks
        httpResponse.setHeader("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "img-src 'self' data: https: blob:; " +
            "font-src 'self' data: https://fonts.gstatic.com; " +
            "connect-src 'self' ws: wss: https:; " +
            "media-src 'self'; " +
            "object-src 'none'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'; " +
            "upgrade-insecure-requests");

        // Referrer-Policy: Controls referrer information
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions-Policy: Controls browser features
        httpResponse.setHeader("Permissions-Policy", 
            "geolocation=(), " +
            "microphone=(), " +
            "camera=(), " +
            "payment=(), " +
            "usb=(), " +
            "magnetometer=(), " +
            "accelerometer=(), " +
            "gyroscope=()");

        // Cache-Control for sensitive endpoints
        String requestURI = httpRequest.getRequestURI();
        if (requestURI.startsWith("/api/auth/") || requestURI.startsWith("/api/user/")) {
            httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            httpResponse.setHeader("Pragma", "no-cache");
            httpResponse.setHeader("Expires", "0");
        }

        // Cross-Origin-Embedder-Policy: Enables certain features that require cross-origin isolation
        httpResponse.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

        // Cross-Origin-Opener-Policy: Isolates the browsing context
        httpResponse.setHeader("Cross-Origin-Opener-Policy", "same-origin");

        // Cross-Origin-Resource-Policy: Controls access to resources from other origins
        httpResponse.setHeader("Cross-Origin-Resource-Policy", "same-origin");

        // Server header removal for security through obscurity
        httpResponse.setHeader("Server", "");

        // Add cookie security attributes if this is an authentication endpoint
        if (requestURI.startsWith("/api/auth/")) {
            addCookieSecurityHeaders(httpResponse);
        }

        log.debug("Security headers added for request: {}", requestURI);
        
        chain.doFilter(request, response);
    }

    /**
     * Adds cookie-specific security headers for authentication endpoints
     */
    private void addCookieSecurityHeaders(HttpServletResponse response) {
        // Ensure cookies are treated securely
        response.setHeader("Set-Cookie-SameSite", "Strict");
        
        // Additional cookie protection headers
        response.setHeader("Cookie-Security", "Secure; HttpOnly; SameSite=Strict");
        
        log.debug("Cookie security headers added");
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("SecurityHeadersFilter initialized");
    }

    @Override
    public void destroy() {
        log.info("SecurityHeadersFilter destroyed");
    }
}
