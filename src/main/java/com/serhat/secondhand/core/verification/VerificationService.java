package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.core.verification.repository.VerificationRepository;
import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.UserNotificationService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService implements IVerificationService {

    private final VerificationConfig verificationConfig;
    private final VerificationRepository verificationRepository;
    private final UserNotificationService userNotificationService;
    private final IUserService userService;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int CODE_LENGTH = 6;

   @Override
    public String generateCode() {
        int min = (int) Math.pow(10, CODE_LENGTH - 1);
        int max = (int) Math.pow(10, CODE_LENGTH) - 1;
        int code = secureRandom.nextInt((max - min) + 1) + min;
        return String.valueOf(code);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Verification generateVerification(User user, String code ,CodeType codeType) {
        var oldVerifications = verificationRepository.findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(user, codeType, LocalDateTime.now());
        oldVerifications.forEach(v -> { v.setCodeExpiresAt(LocalDateTime.now()); v.setVerified(true); });
        if (!oldVerifications.isEmpty()) {
            verificationRepository.saveAll(oldVerifications);
        }
        
        Verification verification = new Verification();
        verification.setUser(user);
        verification.setCode(code);
        verification.setCodeType(codeType);
        verification.setCreatedAt(LocalDateTime.now());
        verification.setCodeExpiresAt(LocalDateTime.now().plusMinutes(verificationConfig.getExpiryMinutes()));
        verification.setVerificationAttemptLeft(3);
        verification.setVerified(false);
        verificationRepository.save(verification);
        return verification;
    }
    
    @Override
    public Optional<Verification> findLatestActiveVerification(User user, CodeType codeType) {
        return verificationRepository.findTopByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfterOrderByCreatedAtDesc(user, codeType, LocalDateTime.now());
    }

    @Override
    public List<Verification> findAllActiveVerifications(User user, CodeType codeType) {
        return verificationRepository.findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(user, codeType, LocalDateTime.now());
    }
    
    @Override
    public boolean validateVerificationCode(User user, String code, CodeType codeType) {
        // Doğrulama kodları (2FA / şifre sıfırlama) hiçbir log seviyesinde yazılmamalıdır.
        log.debug("Validating verification code for user id: {}, codeType: {}", user.getId(), codeType);

        LocalDateTime now = LocalDateTime.now();

        Optional<Verification> verification = verificationRepository.findActiveVerificationByUserCodeTypeAndCode(
                user, codeType, code, now);

        if (verification.isEmpty()) {
            int activeCount = verificationRepository.findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(
                    user, codeType, now).size();
            log.debug("No matching active verification found for user id: {}, active count: {}",
                    user.getId(), activeCount);
        }

        return verification.isPresent();
    }

    public Result<Void> sendAccountVerificationCode(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);

        if (user.isAccountVerified()) {
            return Result.error(UserErrorCodes.ACCOUNT_ALREADY_VERIFIED);
        }

        String code = generateCode();
        generateVerification(user, code, CodeType.ACCOUNT_VERIFICATION);
        userNotificationService.sendVerificationCodeNotification(user, code);

        log.info("Verification code sent to user with email: {}", user.getEmail());
        return Result.success();
    }

    public Result<Void> verifyUser(VerificationRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        // Kullanıcının girdiği kod ve depodaki kod log'a yazılmamalıdır.
        log.info("Verifying user id: {}", user.getId());

        var verificationOpt = findLatestActiveVerification(user, CodeType.ACCOUNT_VERIFICATION);

        if (verificationOpt.isEmpty()) {
            return Result.error(UserErrorCodes.NO_ACTIVE_VERIFICATION_CODE);
        }

        var verification = verificationOpt.get();

        if (!request.code().equals(verification.getCode())) {
            decrementVerificationAttempts(verification);
            int verificationAttemptLeft = verification.getVerificationAttemptLeft();

            if (verificationAttemptLeft <= 0) {
                user.setAccountStatus(AccountStatus.BLOCKED);
                userService.update(user);
                throw new VerificationLockedException("Too many failed attempts. Your account has been blocked.");
            }
            return Result.error(
                    String.format(UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getMessage(), verificationAttemptLeft),
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getCode());
        }

        markVerificationAsUsed(verification);
        user.setAccountVerified(true);
        userService.update(user);

        log.info("User verified successfully: {}", user.getEmail());
        return Result.success();
    }
    
    @Override
    public void markVerificationAsUsed(Verification verification) {
        verification.setVerified(true);
        verificationRepository.save(verification);
    }
    
    @Override
    public void decrementVerificationAttempts(Verification verification) {
        int attemptsLeft = verification.getVerificationAttemptLeft() - 1;
        verification.setVerificationAttemptLeft(attemptsLeft);
        verificationRepository.save(verification);
    }
}
