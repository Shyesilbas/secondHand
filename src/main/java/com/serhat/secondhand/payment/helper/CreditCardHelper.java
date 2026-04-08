package com.serhat.secondhand.payment.helper;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;

public final class CreditCardHelper {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    
        private CreditCardHelper() {
        throw new UnsupportedOperationException("Utility class");
    }

        public static String generateCardNumber() {
        StringBuilder cardNumber = new StringBuilder();
        
                for (int i = 0; i < 15; i++) {
            cardNumber.append(SECURE_RANDOM.nextInt(10));
        }
        
                int checkDigit = calculateLuhnCheckDigit(cardNumber.toString());
        cardNumber.append(checkDigit);
        
        return cardNumber.toString();
    }

        public static String generateCvv() {
        StringBuilder cvv = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            cvv.append(SECURE_RANDOM.nextInt(10));
        }
        return cvv.toString();
    }

        public static int generateExpiryMonth() {
        return LocalDate.now().getMonthValue();
    }

        public static int generateExpiryYear() {
        return LocalDate.now().getYear() + 5;
    }

        private static int calculateLuhnCheckDigit(String partialNumber) {
        int sum = 0;
        boolean alternate = true;         
        for (int i = partialNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(partialNumber.charAt(i));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return (10 - (sum % 10)) % 10;
    }

        public static boolean hasAvailableCredit(BigDecimal currentAmount, BigDecimal creditLimit, BigDecimal transactionAmount) {
        if (currentAmount == null || creditLimit == null || transactionAmount == null) {
            return false;
        }
        
        BigDecimal availableCredit = creditLimit.subtract(currentAmount);
        return availableCredit.compareTo(transactionAmount) >= 0;
    }

        public static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        
        String cleanedNumber = cardNumber.replaceAll("[\\s-]", "");
        if (cleanedNumber.length() == 16) {
            return "**** **** **** " + cleanedNumber.substring(12);
        }
        
        return "****";
    }

}