package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.auth.application.UserDetailsServiceImpl;
import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.core.security.CookieUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final TokenService tokenService;
    private final UserDetailsServiceImpl userDetailsService;
    private final CookieUtils cookieUtils;

    // Public endpoints that should not be filtered
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",  // Add refresh endpoint
            "/api/auth/debug/cookies", // Debug endpoint for cookie testing
            "/api/test/rate-limit", // Rate limit testing endpoints
            "/swagger-ui",
            "/api-docs",
            "/v3/api-docs",
            "/swagger-resources",
            "/api/auth/oauth2/**",
            "/login/oauth2/code/**",
            "/oauth2/**",
            "/webjars",
            "/ws/**"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = null;
            String userEmail = null;

            // Try to get token from Authorization header first (for API clients)
            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                userEmail = jwtUtils.extractUsername(jwt);
                log.debug("Token extracted from Authorization header");
            } 
            // If no Authorization header, try to get token from cookies (for web clients)
            else {
                jwt = cookieUtils.getAccessTokenFromCookies(request).orElse(null);
                if (jwt != null) {
                    userEmail = jwtUtils.extractUsername(jwt);
                    log.debug("Token extracted from cookie");
                }
            }

            // If no token found, continue without authentication
            if (jwt == null || userEmail == null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                TokenStatus status = tokenService.getTokenStatus(jwt).orElse(TokenStatus.REVOKED);

                // First check JWT expiry
                if (!jwtUtils.isTokenValid(jwt, userDetailsService.loadUserByUsername(userEmail))) {
                    sendTokenError(response, request, TokenStatus.EXPIRED);
                    return;
                }

                // Then DB status
                if (status != TokenStatus.ACTIVE) {
                    sendTokenError(response, request, status);
                    return;
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetailsService.loadUserByUsername(userEmail),
                        null,
                        userDetailsService.loadUserByUsername(userEmail).getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            log.error("Authentication error: ", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }


    private void sendTokenError(HttpServletResponse response, HttpServletRequest request, TokenStatus tokenStatus) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        String message;
        String errorCode;
        
        if (tokenStatus == TokenStatus.REVOKED) {
            message = "Session revoked. Log in again";
            errorCode = "SESSION_REVOKED";
        } else if (tokenStatus == TokenStatus.EXPIRED) {
            message = "Session Expired. Login again";
            errorCode = "SESSION_EXPIRED";
        } else {
            message = "Invalid session!.";
            errorCode = "SESSION_INVALID";
        }
        
        String errorResponse = """
            {
                "timestamp": "%s",
                "status": 401,
                "error": "Unauthorized",
                "message": "%s",
                "path": "%s",
                "errorCode": "%s"
            }
            """.formatted(
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                message,
                request.getRequestURI(),
                errorCode
            );
        
        response.getWriter().write(errorResponse);
        log.info("Token access blocked - Status: {}, Path: {}", tokenStatus, request.getRequestURI());
    }
}
