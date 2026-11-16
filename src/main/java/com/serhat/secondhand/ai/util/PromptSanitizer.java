package com.serhat.secondhand.ai.util;

/**
 * Escapes and truncates untrusted text before placing it inside prompts so user-written
 * data cannot break out of {@code <untrusted_evidence>} fences or bloat token budgets.
 */
public final class PromptSanitizer {

    private PromptSanitizer() {
    }

    public static String escapeUntrustedText(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    public static String truncate(String value, int maxChars) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return "";
        }
        return trimmed.length() <= maxChars ? trimmed : trimmed.substring(0, maxChars);
    }

    public static String wrapUntrustedEvidence(String source, String value, int maxChars) {
        String clipped = truncate(value, maxChars);
        String body = clipped.isEmpty() ? "-" : escapeUntrustedText(clipped);
        return "<untrusted_evidence source=\"" + escapeUntrustedText(source) + "\">\n"
                + body
                + "\n</untrusted_evidence>";
    }
}
