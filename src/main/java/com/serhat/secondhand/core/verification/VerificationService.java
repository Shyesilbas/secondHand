package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService implements IVerificationService {

    private final VerificationRepository verificationRepository;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int CODE_LENGTH = 6;

   @Override
    public String generateCode() {
        int min = (int) Math.pow(10, CODE_LENGTH - 1); // 100000
        int max = (int) Math.pow(10, CODE_LENGTH) - 1; // 999999
        int code = secureRandom.nextInt((max - min) + 1) + min;
        return String.valueOf(code);
    }

    @Override
    public Verification generateVerification(User user, String code ,CodeType codeType) {
        Verification verification = new Verification();
        verification.setUser(user);
        verification.setCode(code);
        verification.setCodeType(codeType);
        verification.setCreatedAt(LocalDateTime.now());
        verification.setCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        verification.setVerificationAttemptLeft(3);
        verification.setVerified(false);
        verificationRepository.save(verification);
        return verification;
    }
    
    @Override
    public Optional<Verification> findLatestActiveVerification(User user, CodeType codeType) {
        return verificationRepository.findLatestActiveVerificationByUserAndCodeType(user, codeType, LocalDateTime.now());
    }
    
    @Override
    public boolean validateVerificationCode(User user, String code, CodeType codeType) {
        Optional<Verification> verification = verificationRepository.findActiveVerificationByUserCodeTypeAndCode(
                user, codeType, code, LocalDateTime.now());
        return verification.isPresent();
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
