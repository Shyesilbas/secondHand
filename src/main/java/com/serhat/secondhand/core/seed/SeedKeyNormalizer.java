package com.serhat.secondhand.core.seed;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Shared utility for normalizing human-readable labels into stable, uppercase
 * database keys.  Every DataInitializer must use this instead of a local
 * {@code toKey()} copy so that key generation stays consistent project-wide.
 *
 * <p>Examples:
 * <pre>
 *   "Mercedes-Benz"  →  "MERCEDES_BENZ"
 *   "H&amp;M"           →  "H_M"
 *   "Levi's"         →  "LEVI_S"
 *   "Ders Kitabı"    →  "DERS_KITABI"
 * </pre>
 */
public final class SeedKeyNormalizer {

    private SeedKeyNormalizer() { /* utility */ }

    public static String toKey(String label) {
        if (label == null || label.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "");
        return normalized.trim()
                .toUpperCase(Locale.ROOT)
                .replace('&', ' ')
                .replace('\'', ' ')
                .replace('-', ' ')
                .replace('.', ' ')
                .replaceAll("\\s+", "_");
    }
}
