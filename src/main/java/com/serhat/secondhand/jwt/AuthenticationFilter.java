package com.serhat.secondhand.jwt;

import com.serhat.secondhand.dto.TokenValidationResult;
import com.serhat.secondhand.entity.enums.TokenStatus;
import com.serhat.secondhand.service.TokenService;
import com.serhat.secondhand.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenService tokenService;

    // Public endpoints that should not be filtered
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register", 
            "/api/auth/refresh",
            "/swagger-ui",
            "/api-docs",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars"
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
            String accessToken = extractTokenFromHeader(request);

            if (accessToken == null) {
                log.debug("No access token found in Authorization header for request: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            // Check if token is revoked or expired in database
            String jti = jwtUtils.extractJti(accessToken);
            TokenValidationResult validationResult = tokenService.validateTokenByJti(jti);
            
            if (!validationResult.isValid()) {
                sendTokenError(response, request, validationResult.getStatus());
                return;
            }

            String username = jwtUtils.extractUsername(accessToken);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtils.isTokenValid(accessToken, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set for user: {}", username);
                } else {
                    log.debug("Invalid token for user: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("Authentication error: ", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer eyJhbGciOiJIUzUxMiJ9..."
     */
    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Remove "Bearer " prefix
        }
        
        return null;
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
