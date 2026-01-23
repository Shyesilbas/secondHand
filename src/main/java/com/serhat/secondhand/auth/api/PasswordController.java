package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.auth.application.PasswordService;
import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import com.serhat.secondhand.auth.domain.dto.response.ForgotPasswordResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        var result = passwordService.changePassword(request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/forgot")
    @Operation(
        summary = "Forgot password",
        description = "Request a password reset token for the given email address"
    )
    @ApiResponse(responseCode = "200", description = "Password reset instructions sent (if email exists)")
    @ApiResponse(responseCode = "400", description = "Invalid email format")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        
        var result = passwordService.forgotPasswordWithCode(request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }

        return ResponseEntity.ok(ForgotPasswordResponse.builder()
                .message("Check your email account for password reset verification code.")
                .status("success")
                .verificationCode(result.getData())
                .build());
    }

    @PostMapping("/reset")
    @Operation(
        summary = "Reset password",
        description = "Reset password using the provided reset token"
    )
    @ApiResponse(responseCode = "200", description = "Password reset successfully")
    @ApiResponse(responseCode = "400", description = "Invalid or expired token, or password requirements not met")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        var result = passwordService.resetPassword(request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        
        return ResponseEntity.ok(Map.of(
            "message", result.getData(),
            "status", "success"
        ));
    }
} 