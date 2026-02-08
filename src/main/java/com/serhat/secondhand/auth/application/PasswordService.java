package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public Result<String> changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        log.info("Password change attempt for user: {}", username);

        Result<User> userResult = userService.findByEmail(username);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        
        User user = userResult.getData();
        
        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            return Result.error(AuthErrorCodes.ACCOUNT_NOT_ACTIVE);
        }
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())){
            return Result.error(AuthErrorCodes.INCORRECT_CURRENT_PASSWORD);
        }

        Result<Void> validationResult = validateNewPassword(request.getNewPassword(), user.getPassword());
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password changed successfully for user: {}", username);
        return Result.success("Password changed successfully. Please login again with your new password.");
    }
    
    public Result<String> forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        userService.findOptionalByEmail(request.getEmail())
                .filter(user -> user.getAccountStatus().equals(AccountStatus.ACTIVE))
                .ifPresent(user -> {
                    String verificationCode = verificationService.generateCode();
                    
                    verificationService.generateVerification(user, verificationCode, CodeType.PASSWORD_RESET);
                    
                    
                    log.info("Password reset verification code generated and email sent for user: {}", request.getEmail());
                });

        return Result.success("Check your email account for password reset verification code.");
    }

    public Result<String> forgotPasswordWithCode(ForgotPasswordRequest request) {
        log.info("Password reset requested (with code response) for email: {}", request.getEmail());

        final String[] codeHolder = { null };

        userService.findOptionalByEmail(request.getEmail())
                .filter(user -> user.getAccountStatus().equals(AccountStatus.ACTIVE))
                .ifPresent(user -> {
                    String verificationCode = verificationService.generateCode();
                    verificationService.generateVerification(user, verificationCode, CodeType.PASSWORD_RESET);
                    codeHolder[0] = verificationCode;
                    log.info("Password reset code generated for user: {}", request.getEmail());
                });

        return Result.success(codeHolder[0]);
    }
    
    public Result<String> resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with verification code for email: {}", request.getEmail());

        Result<User> userResult = userService.findByEmail(request.getEmail());
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }

        User user = userResult.getData();

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            return Result.error(AuthErrorCodes.ACCOUNT_NOT_ACTIVE);
        }

        var verificationOpt = verificationService.findLatestActiveVerification(user, CodeType.PASSWORD_RESET);
        
        if (verificationOpt.isEmpty()) {
            return Result.error(UserErrorCodes.NO_ACTIVE_VERIFICATION_CODE);
        }

        var verification = verificationOpt.get();
        
        if (!request.getVerificationCode().equals(verification.getCode())) {
            verificationService.decrementVerificationAttempts(verification);
            int attemptsLeft = verification.getVerificationAttemptLeft();
            
            if (attemptsLeft <= 0) {
                return Result.error(AuthErrorCodes.TOO_MANY_VERIFICATION_ATTEMPTS);
            }
            
            return Result.error(
                    String.format(UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getMessage(), attemptsLeft),
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getCode());
        }

        Result<Void> validationResult = validateNewPassword(request.getNewPassword(), user.getPassword());
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.update(user);
        
        verificationService.markVerificationAsUsed(verification);
        
        tokenService.revokeAllUserTokens(user);
        
        log.info("Password reset completed for user: {}", user.getEmail());
        return Result.success("Password has been reset successfully. Please login with your new password.");
    }

    private Result<Void> validateNewPassword(String newPassword, String currentEncodedPassword) {
        if (passwordEncoder.matches(newPassword, currentEncodedPassword)) {
            return Result.error(AuthErrorCodes.PASSWORD_SAME_AS_CURRENT);
        }
        return Result.success();
    }
} 