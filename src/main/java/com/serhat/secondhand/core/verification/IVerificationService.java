package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.Optional;

public interface IVerificationService {
    String generateCode();

    Verification generateVerification(User user, String code ,CodeType codeType);
    
    Optional<Verification> findLatestActiveVerification(User user, CodeType codeType);

    List<Verification> findAllActiveVerifications(User user, CodeType codeType);
    
    boolean validateVerificationCode(User user, String code, CodeType codeType);
    
    void markVerificationAsUsed(Verification verification);
    
    void decrementVerificationAttempts(Verification verification);
}

