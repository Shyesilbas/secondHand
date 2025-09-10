package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.auth.application.AuthService;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        RegisterResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.email());
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
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
            HttpServletRequest request) {
        
        log.info("Logout request for user: {}", authentication.getName());
        Map<String, String> response = authService.logout(authentication, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        log.info("Token refresh request");
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        log.debug("Token validation for user: {}", authentication.getName());
        Map<String, Object> response = authService.validateToken(authentication);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth2/complete")
    public ResponseEntity<LoginResponse> completeOAuth(@Valid @RequestBody OAuthCompleteRequest request) {
        log.info("Completing OAuth registration for email: {}", request.getEmail());
        LoginResponse response = authService.completeOAuthRegistration(request);
        return ResponseEntity.ok(response);
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
            HttpServletRequest request) {
        
        log.info("Revoke all sessions request for user: {}", authentication.getName());
        Map<String, String> response = authService.revokeAllSessions(authentication, request);
        return ResponseEntity.ok(response);
    }
}