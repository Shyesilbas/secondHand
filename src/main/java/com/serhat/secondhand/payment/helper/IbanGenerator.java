package com.serhat.secondhand.payment.helper;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class IbanGenerator {
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String COUNTRY_CODE = "TR";
    private static final int IBAN_NUMERIC_LENGTH = 16;


    public static String generateIban() {
        StringBuilder iban = new StringBuilder(COUNTRY_CODE);
        
        for (int i = 0; i < IBAN_NUMERIC_LENGTH; i++) {
            iban.append(secureRandom.nextInt(10));
        }
        
        return iban.toString();
    }
}
