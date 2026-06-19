package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.core.security.CookieUtils;
import com.serhat.secondhand.core.security.PublicEndpointRegistry;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final PublicEndpointRegistry publicEndpointRegistry;

    /**
     * Non-controller system paths that are always bypassed by prefix match.
     * These are infrastructure endpoints without a Spring MVC handler method
     * and therefore cannot be annotated with {@code @PublicEndpoint}.
     */
    private static final List<String> SYSTEM_PATH_PREFIXES = List.of(
            "/swagger-ui",
            "/api-docs",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            "/oauth2/",
            "/login/oauth2/",
            "/ws"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // 1. Annotation-driven public controller endpoints (O(1) set lookup after warmup)
        if (publicEndpointRegistry.getPublicEndpoints().contains(path)) {
            return true;
        }
        // 2. Non-controller infrastructure paths — prefix match
        return SYSTEM_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = null;
            String userEmail = null;

            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                userEmail = jwtUtils.extractUsername(jwt);
                log.debug("Token extracted from Authorization header");
            } else {
                jwt = cookieUtils.getAccessTokenFromCookies(request).orElse(null);
                if (jwt != null) {
                    userEmail = jwtUtils.extractUsername(jwt);
                    log.debug("Token extracted from cookie");
                }
            }

            if (jwt == null || userEmail == null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                Long userId = jwtUtils.extractUserId(jwt);
                if (userId == null) {
                    sendTokenError(response, request, TokenStatus.EXPIRED);
                    return;
                }
                if (!jwtUtils.isTokenValid(jwt)) {
                    sendTokenError(response, request, TokenStatus.EXPIRED);
                    return;
                }
                List<SimpleGrantedAuthority> authorities = jwtUtils.extractRoles(jwt).stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                User principal = User.builder()
                        .id(userId)
                        .email(userEmail)
                        .name("")
                        .surname("")
                        .phoneNumber("")
                        .gender(Gender.PREFER_NOT_TO_SAY)
                        .accountStatus(AccountStatus.ACTIVE)
                        .accountVerified(true)
                        .build();
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired for request to {}: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token for request to {}: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature for request to {}: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (JwtException e) {
            log.error("JWT processing error for request to {}: {}", request.getRequestURI(), e.getMessage(), e);
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Unexpected authentication error for request to {}: {}", request.getRequestURI(), e.getMessage(), e);
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
