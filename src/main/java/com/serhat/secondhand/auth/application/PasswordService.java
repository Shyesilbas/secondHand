package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.ChangePasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ForgotPasswordRequest;
import com.serhat.secondhand.auth.domain.dto.request.ResetPasswordRequest;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserNotificationService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordService {

    private static final String GENERIC_RESET_RESPONSE_MESSAGE =
            "If an account exists for the provided email, a password reset code has been sent.";

    private final IUserService userService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final IVerificationService verificationService;
    private final UserNotificationService userNotificationService;
    private final StringRedisTemplate redisTemplate;

    /** Reset codes one email may receive per window; each code has its own 3 attempts. */
    static final int MAX_RESET_CODES_PER_WINDOW = 3;
    static final Duration RESET_CODE_WINDOW = Duration.ofHours(1);
    static final String RESET_REQUEST_KEY_PREFIX = "auth:pwreset:requests:";

    private Result<User> getActiveUser(String email) {
        Result<User> userResult = userService.findByEmail(email);
        if (userResult.isError()) {
            return userResult;
        }

        User user = userResult.getData();
        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            return Result.error(AuthErrorCodes.ACCOUNT_NOT_ACTIVE);
        }

        return Result.success(user);
    }

    public Result<String> changePassword(ChangePasswordRequest request, Authentication authentication) {
        log.info("Password change attempt for user: {}", authentication.getName());

        User user = userService.getAuthenticatedUser(authentication);
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
        
        log.info("Password changed successfully for user: {}", authentication.getName());
        return Result.success("Password changed successfully. Please login again with your new password.");
    }
    
    public Result<String> forgotPassword(ForgotPasswordRequest request) {
        // Hash log: PII korumak ve kullanıcı varlığını sızdırmamak için sadece hash'ten ilk 8 karakter loglanır.
        log.info("Password reset requested (email-hash={})", emailFingerprint(request.getEmail()));

        // Counted per email whether or not an account exists, so the limit itself reveals nothing.
        // Over the limit the response is unchanged and no code or email is produced.
        if (!tryConsumeResetRequest(request.getEmail())) {
            log.warn("Password reset request limit reached (email-hash={})", emailFingerprint(request.getEmail()));
            return Result.success(GENERIC_RESET_RESPONSE_MESSAGE);
        }

        userService.findOptionalByEmail(request.getEmail())
                .filter(user -> user.getAccountStatus().equals(AccountStatus.ACTIVE))
                .ifPresent(user -> {
                    String verificationCode = verificationService.generateCode();
                    verificationService.generateVerification(user, verificationCode, CodeType.PASSWORD_RESET);
                    // Kod yalnızca e-posta kanalı üzerinden gönderilir; HTTP yanıtına ve log'a düşürülmez.
                    userNotificationService.sendPasswordResetCodeNotification(user, verificationCode);
                });

        // Enumeration önlemek için kullanıcı varlığından bağımsız aynı yanıt döner.
        return Result.success(GENERIC_RESET_RESPONSE_MESSAGE);
    }

    private boolean tryConsumeResetRequest(String email) {
        String key = RESET_REQUEST_KEY_PREFIX + sha256Hex(email == null ? "" : email.trim().toLowerCase(Locale.ROOT));
        Long count = redisTemplate.opsForValue().increment(key);
        if (count == null) {
            throw new IllegalStateException("Redis INCR returned null for password reset limiter");
        }
        if (count == 1L) {
            redisTemplate.expire(key, RESET_CODE_WINDOW);
        }
        return count <= MAX_RESET_CODES_PER_WINDOW;
    }

    private static String sha256Hex(String value) {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String emailFingerprint(String email) {
        if (email == null) return "null";
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(email.toLowerCase().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4; i++) sb.append(String.format("%02x", digest[i]));
            return sb.toString();
        } catch (Exception e) {
            return "n/a";
        }
    }
    
    public Result<String> resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt (email-hash={})", emailFingerprint(request.getEmail()));

        // Unknown email, inactive account, no code, wrong code and spent attempts all return the same
        // error, so this endpoint cannot be used to find out whether an account exists.
        Result<User> userResult = getActiveUser(request.getEmail());
        if (userResult.isError()) {
            return Result.error(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE);
        }

        User user = userResult.getData();

        var verificationOpt = verificationService.findLatestActiveVerification(user, CodeType.PASSWORD_RESET);
        if (verificationOpt.isEmpty()) {
            return Result.error(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE);
        }

        var verification = verificationOpt.get();
        if (verification.getVerificationAttemptLeft() <= 0) {
            return Result.error(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE);
        }

        if (!request.getVerificationCode().equals(verification.getCode())) {
            verificationService.decrementVerificationAttempts(verification);
            return Result.error(AuthErrorCodes.INVALID_OR_EXPIRED_RESET_CODE);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return Result.error(AuthErrorCodes.PASSWORD_CONFIRMATION_MISMATCH);
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