package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordService {

    private final IUserService userService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.passwordReset.expiration}")
    private Long passwordResetTokenExpiration;

    public String changePassword(String username, ChangePasswordRequest request) {
        log.info("Password change attempt for user: {}", username);

        User user = userService.findByEmail(username);
        
        // Check account status
        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        validateNewPassword(request.getNewPassword(), request.getConfirmPassword(), user.getPassword());
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        // Revoke all active tokens to force re-login
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password changed successfully for user: {}", username);
        return "Password changed successfully. Please login again with your new password.";
    }
    
    public String forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        userService.findOptionalByEmail(request.getEmail())
                .filter(user -> user.getAccountStatus().equals(AccountStatus.ACTIVE))
                .ifPresent(user -> {
                    String resetToken = jwtUtils.generatePasswordResetToken(user);
                    LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(passwordResetTokenExpiration / 1000);

                    tokenService.createPasswordResetToken(user, resetToken, expiresAt);

                    log.warn("PASSWORD RESET TOKEN (remove this log in production): {}", resetToken);
                    log.info("Password reset token generated for user: {}", request.getEmail());
                });

        return "If the email exists in our system, you will receive a password reset link.";
    }
    
    public String resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with token");

        User user = tokenService.validateAndGetUserByPasswordResetToken(request.getToken());

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        validateNewPassword(request.getNewPassword(), request.getConfirmPassword(), user.getPassword());
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        tokenService.revokePasswordResetToken(request.getToken());
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password reset completed for user: {}", user.getEmail());
        return "Password has been reset successfully. Please login with your new password.";
    }

    private void validateNewPassword(String newPassword, String confirmPassword, String currentEncodedPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }
        if (passwordEncoder.matches(newPassword, currentEncodedPassword)) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
    }
} 