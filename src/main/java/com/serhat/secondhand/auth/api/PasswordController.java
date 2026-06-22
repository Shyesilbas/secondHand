package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.auth.application.PasswordService;
import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.response.ChangePasswordResponse;
import com.serhat.secondhand.auth.domain.dto.response.ForgotPasswordResponse;
import com.serhat.secondhand.auth.domain.dto.response.ResetPasswordResponse;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/passwords")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Password Management", description = "Password change and reset operations")
public class PasswordController {

    private final PasswordService passwordService;

    @PutMapping("/change")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        var result = passwordService.changePassword(request, authentication);
        if (result.isError()) {
            return ResultResponses.ok(result);
        }
        
        return ResponseEntity.ok(ChangePasswordResponse.builder()
                .message(result.getData())
                .status("success")
                .build());
    }

    @PublicEndpoint
    @PostMapping("/forgot")
    @Operation(
        summary = "Forgot password",
        description = "Request a password reset token for the given email address. " +
                "If the email is registered, a code is sent via email; the response is identical regardless of existence to prevent user enumeration."
    )
    @ApiResponse(responseCode = "200", description = "Generic acknowledgement (does not reveal account existence)")
    @ApiResponse(responseCode = "400", description = "Invalid email format")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        var result = passwordService.forgotPassword(request);
        if (result.isError()) {
            return ResultResponses.ok(result);
        }

        // Doğrulama kodu kasıtlı olarak yanıtta yoktur; yalnızca e-posta kanalı üzerinden iletilir.
        return ResponseEntity.ok(ForgotPasswordResponse.builder()
                .message(result.getData())
                .status("success")
                .build());
    }

    @PublicEndpoint
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
            return ResultResponses.ok(result);
        }
        
        return ResponseEntity.ok(ResetPasswordResponse.builder()
                .message(result.getData())
                .status("success")
                .build());
    }
}