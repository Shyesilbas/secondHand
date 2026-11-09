package com.serhat.secondhand.listing.application.books;

import java.util.Optional;

/** ISBN-10 / ISBN-13 checks. Hyphens and spaces are ignored; an ISBN-10 is converted to its 978 ISBN-13. */
public final class Isbn {

    private Isbn() {
    }

    /** The ISBN-13 for a valid ISBN-10 or ISBN-13, empty when the checksum or the format is wrong. */
    public static Optional<String> toIsbn13(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        String s = raw.replaceAll("[\\s-]", "").toUpperCase(java.util.Locale.ROOT);
        if (s.length() == 13 && s.chars().allMatch(Character::isDigit)
                && (s.startsWith("978") || s.startsWith("979"))) {
            return checkDigit13(s.substring(0, 12)) == s.charAt(12) - '0' ? Optional.of(s) : Optional.empty();
        }
        if (s.length() == 10 && s.substring(0, 9).chars().allMatch(Character::isDigit)
                && (Character.isDigit(s.charAt(9)) || s.charAt(9) == 'X')) {
            int sum = 0;
            for (int i = 0; i < 10; i++) {
                int v = s.charAt(i) == 'X' ? 10 : s.charAt(i) - '0';
                sum += v * (10 - i);
            }
            if (sum % 11 != 0) {
                return Optional.empty();
            }
            String body = "978" + s.substring(0, 9);
            return Optional.of(body + checkDigit13(body));
        }
        return Optional.empty();
    }

    private static int checkDigit13(String first12) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += (first12.charAt(i) - '0') * (i % 2 == 0 ? 1 : 3);
        }
        return (10 - sum % 10) % 10;
    }
}
