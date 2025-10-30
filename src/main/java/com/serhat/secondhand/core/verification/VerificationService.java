package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.exception.VerificationLockedException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    private final VerificationRepository verificationRepository;
    private final EmailService emailService;
    private final UserService userService;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int CODE_LENGTH = 6;

    @Value("${app.verification.code.expiry.minutes:3}")
    private int verificationExpiryMinutes;

   @Override
    public String generateCode() {
        int min = (int) Math.pow(10, CODE_LENGTH - 1);
        int max = (int) Math.pow(10, CODE_LENGTH) - 1;
        int code = secureRandom.nextInt((max - min) + 1) + min;
        return String.valueOf(code);
    }

    @Override
    public Verification generateVerification(User user, String code ,CodeType codeType) {
        verificationRepository.findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(user, codeType, LocalDateTime.now())
                .forEach(v -> { v.setCodeExpiresAt(LocalDateTime.now()); v.setVerified(true); });
        
        Verification verification = new Verification();
        verification.setUser(user);
        verification.setCode(code);
        verification.setCodeType(codeType);
        verification.setCreatedAt(LocalDateTime.now());
        verification.setCodeExpiresAt(LocalDateTime.now().plusMinutes(verificationExpiryMinutes));
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
        log.info("Validating verification code for user: {}, codeType: {}, code: {}", 
                user.getEmail(), codeType, code);
        
        LocalDateTime now = LocalDateTime.now();
        log.info("Current time: {}", now);
        
        Optional<Verification> verification = verificationRepository.findActiveVerificationByUserCodeTypeAndCode(
                user, codeType, code, now);
        
        log.info("Verification found: {}", verification.isPresent());
        
        if (verification.isPresent()) {
            Verification v = verification.get();
            log.info("Verification details - Code: {}, ExpiresAt: {}, IsVerified: {}", 
                    v.getCode(), v.getCodeExpiresAt(), v.isVerified());
        } else {
            List<Verification> allActive = verificationRepository.findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(
                    user, codeType, now);
            log.warn("No matching verification found. All active verifications count: {}", allActive.size());
            
            for (Verification v : allActive) {
                log.warn("Active verification - Code: {}, ExpiresAt: {}, IsVerified: {}, Match: {}", 
                        v.getCode(), v.getCodeExpiresAt(), v.isVerified(), v.getCode().equals(code));
            }
        }
        
        return verification.isPresent();
    }

    public void sendAccountVerificationCode(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);

        if (user.isAccountVerified()) {
            throw new BusinessException(UserErrorCodes.ACCOUNT_ALREADY_VERIFIED);
        }

        String code = generateCode();
        generateVerification(user, code, CodeType.ACCOUNT_VERIFICATION);
        emailService.sendVerificationCodeEmail(user, code);

        log.info("Verification code sent to user with email: {}", user.getEmail());
    }

    public void verifyUser(VerificationRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        log.info("Verifying user with email: {}", user.getEmail());
        log.info("Code written by user: {}", request.code());

        var verificationOpt = findLatestActiveVerification(user, CodeType.ACCOUNT_VERIFICATION);

        if (verificationOpt.isEmpty()) {
            throw new BusinessException(UserErrorCodes.NO_ACTIVE_VERIFICATION_CODE);
        }

        var verification = verificationOpt.get();
        log.info("Stored verification code: {}", verification.getCode());

        if (!request.code().equals(verification.getCode())) {
            decrementVerificationAttempts(verification);
            int verificationAttemptLeft = verification.getVerificationAttemptLeft();

            if (verificationAttemptLeft <= 0) {
                user.setAccountStatus(AccountStatus.BLOCKED);
                userService.update(user);
                throw new VerificationLockedException("Too many failed attempts. Your account has been blocked.");
            }
            throw new BusinessException(
                    String.format(UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getMessage(), verificationAttemptLeft),
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getHttpStatus(),
                    UserErrorCodes.INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS.getCode());
        }

        markVerificationAsUsed(verification);
        user.setAccountVerified(true);
        userService.update(user);

        log.info("User verified successfully: {}", user.getEmail());
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
