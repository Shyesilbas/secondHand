package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.auth.application.IAuthService;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.serhat.secondhand.core.security.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {

    private final IAuthService authService;
    private final CookieUtils cookieUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        Result<RegisterResponse> result = authService.register(request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse) {
        log.info("Login request for email: {}", request.email());
        LoginResponse response = authService.login(request);

        cookieUtils.setAccessTokenCookie(httpResponse, response.getAccessToken());
        cookieUtils.setRefreshTokenCookie(httpResponse, response.getRefreshToken(), request.rememberMe());
        
                Map<String, Object> responseMap = Map.of(
            "message", response.getMessage(),
            "userId", response.getUserId(),
            "email", response.getEmail(),
            "success", true
        );
        
        log.info("Login successful for user: {}, tokens set in secure cookies", request.email());
        return ResponseEntity.ok(responseMap);
    }

    @GetMapping("/oauth2/google")
    public ResponseEntity<Void> redirectToGoogle() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/oauth2/authorization/google"))
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        
        log.info("Logout request for user: {}", authentication.getName());
        Map<String, String> response = authService.logout(authentication, request);
        
                cookieUtils.clearAuthCookies(httpResponse);
        
        log.info("Logout successful for user: {}, cookies cleared", authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        log.info("Token refresh request");

        String refreshToken = cookieUtils.getRefreshTokenFromCookies(request)
                .orElseThrow(() -> new RuntimeException("Refresh token not found in cookies"));

        LoginResponse response = authService.refreshToken(refreshToken);

        cookieUtils.setAccessTokenCookie(httpResponse, response.getAccessToken());
        cookieUtils.setRefreshTokenCookie(httpResponse, response.getRefreshToken(), response.isRememberMe());
        
                Map<String, Object> responseMap = Map.of(
            "message", response.getMessage(),
            "userId", response.getUserId(),
            "email", response.getEmail(),
            "success", true
        );
        
        log.info("Token refresh successful, new tokens set in cookies");
        return ResponseEntity.ok(responseMap);
    }


    @Deprecated
    @Operation(summary = "Validate token (DEPRECATED)", description = "This endpoint is deprecated. JWT validation happens automatically via AuthenticationFilter. Use /api/v1/users/me instead.")
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.debug("Token validation failed: no authentication or not authenticated");
            Map<String, Object> response = Map.of(
                "valid", false,
                "message", "No valid authentication found"
            );
            return ResponseEntity.ok(response);
        }
        
        log.debug("Token validation for user: {}", authentication.getName());
        Map<String, Object> response = authService.validateToken(authentication);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth2/complete")
    public ResponseEntity<Map<String, Object>> completeOAuth(
            @Valid @RequestBody OAuthCompleteRequest request,
            HttpServletResponse httpResponse) {
        log.info("Completing OAuth registration for email: {}", request.getEmail());
        LoginResponse response = authService.completeOAuthRegistration(request);
        
                cookieUtils.setAccessTokenCookie(httpResponse, response.getAccessToken());
        cookieUtils.setRefreshTokenCookie(httpResponse, response.getRefreshToken());
        
                Map<String, Object> responseMap = Map.of(
            "message", response.getMessage(),
            "userId", response.getUserId(),
            "email", response.getEmail(),
            "success", true
        );
        
        log.info("OAuth completion successful for user: {}, tokens set in secure cookies", request.getEmail());
        return ResponseEntity.ok(responseMap);
    }

    @GetMapping("/debug/cookies")
    public ResponseEntity<Map<String, Object>> debugCookies(HttpServletRequest request) {
        log.info("Debug cookies request");
        
        Map<String, Object> debugInfo = new java.util.HashMap<>();
        
                var accessToken = cookieUtils.getAccessTokenFromCookies(request);
        debugInfo.put("hasAccessToken", accessToken.isPresent());
        if (accessToken.isPresent()) {
            debugInfo.put("accessTokenLength", accessToken.get().length());
        }
        
                var refreshToken = cookieUtils.getRefreshTokenFromCookies(request);
        debugInfo.put("hasRefreshToken", refreshToken.isPresent());
        if (refreshToken.isPresent()) {
            debugInfo.put("refreshTokenLength", refreshToken.get().length());
        }
        
                if (request.getCookies() != null) {
            debugInfo.put("totalCookies", request.getCookies().length);
            java.util.List<String> cookieNames = java.util.Arrays.stream(request.getCookies())
                    .map(jakarta.servlet.http.Cookie::getName)
                    .collect(java.util.stream.Collectors.toList());
            debugInfo.put("cookieNames", cookieNames);
        } else {
            debugInfo.put("totalCookies", 0);
            debugInfo.put("cookieNames", java.util.Collections.emptyList());
        }
        
        return ResponseEntity.ok(debugInfo);
    }

    @PostMapping("/revoke-all-sessions")
    @Operation(summary = "Revoke all user sessions", description = "Invalidates all active sessions for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All sessions revoked successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, String>> revokeAllSessions(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        
        log.info("Revoke all sessions request for user: {}", authentication.getName());
        Map<String, String> response = authService.revokeAllSessions(authentication, request);
        
                cookieUtils.clearAuthCookies(httpResponse);
        
        log.info("All sessions revoked for user: {}, cookies cleared", authentication.getName());
        return ResponseEntity.ok(response);
    }
}