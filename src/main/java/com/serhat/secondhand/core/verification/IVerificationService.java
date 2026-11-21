package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.Optional;

public interface IVerificationService {
    String generateCode();

    Verification generateVerification(User user, String code ,CodeType codeType);
    
    Optional<Verification> findLatestActiveVerification(User user, CodeType codeType);

    List<Verification> findAllActiveVerifications(User user, CodeType codeType);
    
    /**
     * Marks the matching active code as used and returns true, or returns false when no active code matches.
     * Runs in the caller's transaction, so a rolled-back payment leaves the code usable.
     */
    boolean consumeVerificationCode(User user, String code, CodeType codeType);
    
    void markVerificationAsUsed(Verification verification);
    
    void decrementVerificationAttempts(Verification verification);
}

