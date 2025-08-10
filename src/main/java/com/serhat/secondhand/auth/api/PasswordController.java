package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.auth.application.PasswordService;
import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Password Management", description = "Password change and reset operations")
public class PasswordController {

    private final PasswordService passwordService;

    @PutMapping("/change")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        String message = passwordService.changePassword(request);
        
        return ResponseEntity.ok(message);
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