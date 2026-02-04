package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.core.security.CookieUtils;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;

        private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",              "/api/auth/debug/cookies",             "/api/test/rate-limit",             "/swagger-ui",
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
