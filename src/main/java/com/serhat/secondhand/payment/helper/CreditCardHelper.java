package com.serhat.secondhand.payment.helper;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.regex.Pattern;

public final class CreditCardHelper {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Pattern CARD_NUMBER_PATTERN = Pattern.compile("^\\d{16}$");
    private static final Pattern CVV_PATTERN = Pattern.compile("^\\d{3,4}$");
    
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

        public static boolean isValidCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return false;
        }
        
                String cleanedNumber = cardNumber.replaceAll("[\\s-]", "");
        
        return CARD_NUMBER_PATTERN.matcher(cleanedNumber).matches() && 
               passesLuhnCheck(cleanedNumber);
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

        public static boolean isValidCvv(String cvv) {
        if (cvv == null || cvv.isEmpty()) {
            return false;
        }
        return CVV_PATTERN.matcher(cvv).matches();
    }

        public static boolean isValidExpiryDate(int month, int year) {
        if (month < 1 || month > 12) {
            return false;
        }
        
        LocalDate currentDate = LocalDate.now();
        LocalDate expiryDate = LocalDate.of(year, month, 1).withDayOfMonth(
            LocalDate.of(year, month, 1).lengthOfMonth()
        );
        
        return expiryDate.isAfter(currentDate);
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

        public static String formatCardNumber(String cardNumber) {
        if (cardNumber == null) {
            return null;
        }
        
        String cleanedNumber = cardNumber.replaceAll("[\\s-]", "");
        if (cleanedNumber.length() == 16) {
            return cleanedNumber.substring(0, 4) + " " +
                   cleanedNumber.substring(4, 8) + " " +
                   cleanedNumber.substring(8, 12) + " " +
                   cleanedNumber.substring(12, 16);
        }
        
        return cleanedNumber;
    }

        private static boolean passesLuhnCheck(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cardNumber.charAt(i));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return sum % 10 == 0;
    }

        public static String getCardType(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "UNKNOWN";
        }
        
        String cleanedNumber = cardNumber.replaceAll("[\\s-]", "");
        
        if (cleanedNumber.startsWith("4")) {
            return "VISA";
        } else if (cleanedNumber.startsWith("5") || cleanedNumber.startsWith("2")) {
            return "MASTERCARD";
        } else if (cleanedNumber.startsWith("3")) {
            return "AMERICAN_EXPRESS";
        }
        
        return "UNKNOWN";
    }
}