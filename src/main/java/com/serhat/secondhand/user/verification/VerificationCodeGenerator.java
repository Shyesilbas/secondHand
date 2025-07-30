package com.serhat.secondhand.user.verification;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class VerificationCodeGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int CODE_LENGTH = 6;

    public String generateCode() {
        int min = (int) Math.pow(10, CODE_LENGTH - 1); // 100000
        int max = (int) Math.pow(10, CODE_LENGTH) - 1; // 999999
        int code = secureRandom.nextInt((max - min) + 1) + min;
        return String.valueOf(code);
    }
}
