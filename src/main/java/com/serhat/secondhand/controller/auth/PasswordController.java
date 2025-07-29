package com.serhat.secondhand.controller.auth;

import com.serhat.secondhand.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.service.PasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Password Management", description = "Password change and reset operations")
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/change")
    @Operation(
        summary = "Change password",
        description = "Change the current user's password"
    )
    @SecurityRequirement(name = "JWT")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed or password requirements not met")
    @ApiResponse(responseCode = "401", description = "Current password is incorrect or unauthorized")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        String message = passwordService.changePassword(username, request);
        
        return ResponseEntity.ok(Map.of(
            "message", message,
            "status", "success"
        ));
    }

    @PostMapping("/forgot")
    @Operation(
        summary = "Forgot password",
        description = "Request a password reset token for the given email address"
    )
    @ApiResponse(responseCode = "200", description = "Password reset instructions sent (if email exists)")
    @ApiResponse(responseCode = "400", description = "Invalid email format")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        
        String message = passwordService.forgotPassword(request);
        
        return ResponseEntity.ok(Map.of(
            "message", message,
            "status", "success"
        ));
    }

    @PostMapping("/reset")
    @Operation(
        summary = "Reset password",
        description = "Reset password using the provided reset token"
    )
    @ApiResponse(responseCode = "200", description = "Password reset successfully")
    @ApiResponse(responseCode = "400", description = "Invalid or expired token, or password requirements not met")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        String message = passwordService.resetPassword(request);
        
        return ResponseEntity.ok(Map.of(
            "message", message,
            "status", "success"
        ));
    }
} 