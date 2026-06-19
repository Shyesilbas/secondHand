package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.CorsConfigProperties;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Security Headers Filter to add essential security headers to all HTTP responses.
 * This filter adds protection against various web vulnerabilities.
 *
 * <p>CSP policy rationale:
 * <ul>
 *   <li>{@code script-src 'self'} – Vite prod build emits only external JS bundles;
 *       no {@code eval()} or inline scripts are used in the frontend.</li>
 *   <li>{@code style-src 'self' 'unsafe-inline'} – CSS-in-JS libraries (framer-motion)
 *       inject inline styles at runtime; this is an accepted trade-off until
 *       they support CSP nonces.</li>
 *   <li>{@code connect-src} – dynamically built from CORS allowed-origins so that
 *       API and WebSocket connections work without opening to all origins.</li>
 * </ul>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class SecurityHeadersFilter implements Filter {

    private final CorsConfigProperties corsConfigProperties;

    /** Built once on first request, then cached. */
    private volatile String cspHeader;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // X-Content-Type-Options: Prevents MIME type sniffing attacks
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // X-Frame-Options: Prevents clickjacking attacks
        httpResponse.setHeader("X-Frame-Options", "DENY");

        // X-XSS-Protection: Disabled – modern browsers removed the auditor and
        // the old "1; mode=block" can introduce side-channel leaks. A strong CSP
        // is the proper replacement.
        httpResponse.setHeader("X-XSS-Protection", "0");

        // Strict-Transport-Security: Enforces HTTPS connections
        if (httpRequest.isSecure()) {
            httpResponse.setHeader("Strict-Transport-Security",
                    "max-age=31536000; includeSubDomains; preload");
        }

        // Content-Security-Policy: Prevents various injection attacks
        httpResponse.setHeader("Content-Security-Policy", buildCsp());

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

        // Cross-Origin-Embedder-Policy: "unsafe-none" allows loading cross-origin
        // resources (Google Fonts, gstatic) that do not set CORP headers. The
        // previous "require-corp" broke font loading.
        httpResponse.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

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

    // ------------------------------------------------------------------ CSP
    /**
     * Builds a strict Content-Security-Policy string. The connect-src directive
     * is derived from the application's CORS allowed-origins list so that API
     * calls and WebSocket connections are allowed only to known hosts.
     */
    private String buildCsp() {
        String cached = cspHeader;
        if (cached != null) {
            return cached;
        }

        // Build connect-src from CORS origins + their ws/wss equivalents
        String connectSrc = buildConnectSrc();

        String csp =
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "img-src 'self' data: blob:; " +
                "font-src 'self' data: https://fonts.gstatic.com; " +
                connectSrc +
                "media-src 'self'; " +
                "object-src 'none'; " +
                "frame-ancestors 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self'; " +
                "upgrade-insecure-requests";

        cspHeader = csp;
        log.info("CSP policy built: {}", csp);
        return csp;
    }

    /**
     * Derives {@code connect-src} from CORS allowed-origins.
     * For each HTTP origin, the corresponding ws:// or wss:// variant is added
     * so that STOMP/WebSocket connections work.
     *
     * <p>Example: {@code http://localhost:5173} → also adds {@code ws://localhost:5173}.
     */
    private String buildConnectSrc() {
        StringBuilder sb = new StringBuilder("connect-src 'self'");

        List<String> origins = corsConfigProperties.getAllowedOrigins();
        if (origins != null && !origins.isEmpty()) {
            // Deduplicate ws/wss variants
            String wsOrigins = origins.stream()
                    .map(origin -> {
                        try {
                            URI uri = URI.create(origin);
                            String wsScheme = "https".equals(uri.getScheme()) ? "wss" : "ws";
                            String host = uri.getHost();
                            int port = uri.getPort();
                            String wsOrigin = wsScheme + "://" + host + (port > 0 ? ":" + port : "");
                            return origin + " " + wsOrigin;
                        } catch (Exception e) {
                            log.warn("Could not parse CORS origin for CSP connect-src: {}", origin);
                            return origin;
                        }
                    })
                    .collect(Collectors.joining(" "));

            sb.append(" ").append(wsOrigins);
        }

        sb.append("; ");
        return sb.toString();
    }

    /**
     * Adds cookie-specific security headers for authentication endpoints.
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

