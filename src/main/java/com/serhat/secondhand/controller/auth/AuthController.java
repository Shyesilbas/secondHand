package com.serhat.secondhand.controller.auth;

import com.serhat.secondhand.dto.request.LoginRequest;
import com.serhat.secondhand.dto.request.RegisterRequest;
import com.serhat.secondhand.dto.response.LoginResponse;
import com.serhat.secondhand.dto.response.RegisterResponse;
import com.serhat.secondhand.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
        summary = "User registration",
        description = "Register a new user account"
    )
    @ApiResponse(responseCode = "200", description = "Registration successful")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "409", description = "User already exists")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        
        RegisterResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(
        summary = "User login",
        description = "Authenticate user and return JWT tokens"
    )
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(
        summary = "User logout",
        description = "Revokes all refresh tokens and the current access token for the user"
    )
    @SecurityRequirement(name = "JWT")
    @ApiResponse(responseCode = "200", description = "Logout successful")
    @ApiResponse(responseCode = "400", description = "User already logged out")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<Map<String, String>> logout(
            Authentication authentication,
            HttpServletRequest request) {
        
        String username = authentication.getName();
        
        String accessToken = extractTokenFromHeader(request);
        
        String message = authService.logout(username, accessToken);
        
        return ResponseEntity.ok(Map.of(
            "message", message,
            "status", "success"
        ));
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh access token",
        description = "Generate new access and refresh tokens using refresh token"
    )
    @ApiResponse(responseCode = "200", description = "Token refreshed successfully")
    @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody Map<String, String> request) {
        
        String refreshToken = request.get("refreshToken");
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user",
        description = "Get information about the currently authenticated user"
    )
    @SecurityRequirement(name = "JWT")
    @ApiResponse(responseCode = "200", description = "User information retrieved")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<LoginResponse> getCurrentUser(Authentication authentication) {
        
        String username = authentication.getName();
        LoginResponse response = authService.getAuthenticatedUser(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(
        summary = "Validate token",
        description = "Check if the current access token is valid"
    )
    @SecurityRequirement(name = "JWT")
    @ApiResponse(responseCode = "200", description = "Token is valid")
    @ApiResponse(responseCode = "401", description = "Token is invalid")
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        
        return ResponseEntity.ok(Map.of(
            "valid", true,
            "username", authentication.getName(),
            "authorities", authentication.getAuthorities(),
            "message", "Token is valid"
        ));
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
} 