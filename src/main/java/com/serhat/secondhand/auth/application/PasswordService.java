package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.core.exception.VerificationCodeMismatchException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordService {

    private final UserService userService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final IVerificationService verificationService;

    public String changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        log.info("Password change attempt for user: {}", username);

        User user = userService.findByEmail(username);
        
        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())){
            throw new BadCredentialsException("Current password is incorrect");
        }

        validateNewPassword(request.getNewPassword(),  user.getPassword());
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password changed successfully for user: {}", username);
        return "Password changed successfully. Please login again with your new password.";
    }
    
    public String forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        userService.findOptionalByEmail(request.getEmail())
                .filter(user -> user.getAccountStatus().equals(AccountStatus.ACTIVE))
                .ifPresent(user -> {
                    String verificationCode = verificationService.generateCode();
                    
                    verificationService.generateVerification(user, verificationCode, CodeType.PASSWORD_RESET);
                    
                    //emailService.sendPasswordResetEmail(user, verificationCode);

                    log.info("Password reset verification code generated and email sent for user: {}", request.getEmail());
                    log.info("Password reset verification code generated: {}", verificationCode);
                });

        return "Check your email account for password reset verification code.";
    }
    
    public String resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with verification code for email: {}", request.getEmail());

        User user = userService.findByEmail(request.getEmail());

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        var verificationOpt = verificationService.findLatestActiveVerification(user, CodeType.PASSWORD_RESET);
        
        if (verificationOpt.isEmpty()) {
            throw new VerificationCodeMismatchException("No active verification code found. Please request a new code.",
                    "BAD_REQUEST");
        }

        var verification = verificationOpt.get();
        
        if (!request.getVerificationCode().equals(verification.getCode())) {
            verificationService.decrementVerificationAttempts(verification);
            int attemptsLeft = verification.getVerificationAttemptLeft();
            
            if (attemptsLeft <= 0) {
                throw new VerificationCodeMismatchException("Too many failed attempts. Please request a new code.",
                        "BAD_REQUEST");
            }
            
            throw new VerificationCodeMismatchException("Incorrect verification code. Attempts left: " + attemptsLeft,
                    "BAD_REQUEST");
        }

        validateNewPassword(request.getNewPassword(), user.getPassword());
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        verificationService.markVerificationAsUsed(verification);
        
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password reset completed for user: {}", user.getEmail());
        return "Password has been reset successfully. Please login with your new password.";
    }

    private void validateNewPassword(String newPassword, String currentEncodedPassword) {

        if (passwordEncoder.matches(newPassword, currentEncodedPassword)) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
    }
} 