package com.serhat.secondhand.auth.domain.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Reset password request")
public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @NotBlank(message = "Verification code is required")
    @Size(min = 6, max = 6, message = "Verification code must be 6 digits")
    @Pattern(regexp = "^[0-9]{6}$", message = "Verification code must be 6 digits")
    @Schema(description = "6-digit verification code", example = "123456")
    private String verificationCode;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]+$",
        message = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
    )
    @Schema(description = "New password", example = "NewPassword123!")
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    @Schema(description = "New password confirmation", example = "NewPassword123!")
    private String confirmPassword;
} 