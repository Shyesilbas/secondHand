package com.serhat.secondhand.listing.util;

import java.security.SecureRandom;

public class ListingNoGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int LISTING_NO_LENGTH = 8;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private ListingNoGenerator() {
    }

    public static String generate() {
        StringBuilder listingNo = new StringBuilder(LISTING_NO_LENGTH);
        
        for (int i = 0; i < LISTING_NO_LENGTH; i++) {
            int randomIndex = SECURE_RANDOM.nextInt(CHARACTERS.length());
            listingNo.append(CHARACTERS.charAt(randomIndex));
        }
        
        return listingNo.toString();
    }
    

    public static boolean isValidFormat(String listingNo) {
        if (listingNo == null || listingNo.length() != LISTING_NO_LENGTH) {
            return false;
        }
        
        return listingNo.matches("^[A-Z0-9]{8}$");
    }
}