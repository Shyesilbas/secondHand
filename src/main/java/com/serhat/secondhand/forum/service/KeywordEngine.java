package com.serhat.secondhand.forum.service;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class KeywordEngine {

    public List<String> extractKeywords(String title, String description) {
        String input = ((title == null ? "" : title) + " " + (description == null ? "" : description)).trim();
        if (input.isBlank()) return List.of();

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        String[] parts = normalized.split(" ");
        Set<String> uniq = new LinkedHashSet<>();
        for (String p : parts) {
            if (p == null) continue;
            String w = p.trim();
            if (w.length() < 3) continue;
            if (isStopWord(w)) continue;
            uniq.add(w);
            if (uniq.size() >= 20) break;
        }
        return new ArrayList<>(uniq);
    }

    private boolean isStopWord(String w) {
        return switch (w) {
            case "the", "and", "for", "with", "this", "that", "from", "are", "was", "were", "your", "you", "have",
                 "has", "had", "not", "but", "can", "will", "would", "should", "about", "into", "over", "under",
                 "then", "than", "when", "what", "why", "how", "all", "any", "new", "top" -> true;
            default -> false;
        };
    }
}

