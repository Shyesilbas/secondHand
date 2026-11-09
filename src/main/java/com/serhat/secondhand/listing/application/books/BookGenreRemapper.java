package com.serhat.secondhand.listing.application.books;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Moves listings and catalog works off genres that books.json retired. A genre lists the old genres it
 * {@code replaces}; their listings and works get the new genre and its type, plus optional attributes that
 * carried the old genre's meaning (e.g. old "Yaprak Testler" becomes {@code prepFormat=YAPRAK_TEST}); values the
 * seller already set win. Afterwards no listing or work may point at a genre or type books.json no longer has,
 * otherwise the seed fails instead of the pruner silently keeping the old row.
 */
@Component
@RequiredArgsConstructor
@Slf4j
class BookGenreRemapper {

    record Replacement(String from, String to, Map<String, Object> attributes) {
    }

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    void remap(List<Replacement> replacements, Set<String> keptGenres, Set<String> keptTypes) {
        int listings = 0;
        int works = 0;
        for (Replacement r : replacements) {
            if (keptGenres.contains(r.from())) {
                throw new IllegalStateException("books.json: genre " + r.from() + " is both kept and replaced");
            }
            List<UUID> fromIds = jdbc.queryForList("SELECT id FROM book_genres WHERE upper(name) = ?", UUID.class, r.from());
            if (fromIds.isEmpty()) continue;
            UUID fromId = fromIds.get(0);
            Map<String, Object> to = jdbc.queryForMap("SELECT id, book_type_id FROM book_genres WHERE upper(name) = ?", r.to());
            if (!r.attributes().isEmpty()) {
                jdbc.update("""
                        UPDATE listings l SET attributes = CAST(? AS jsonb) || l.attributes
                        FROM books_listings b WHERE b.id = l.id AND b.book_genre_id = ?
                        """, json(r.attributes()), fromId);
            }
            listings += jdbc.update("UPDATE books_listings SET book_genre_id = ?, book_type_id = ? WHERE book_genre_id = ?",
                    to.get("id"), to.get("book_type_id"), fromId);
            works += jdbc.update("UPDATE book_works SET book_genre_id = ?, book_type_id = ? WHERE book_genre_id = ?",
                    to.get("id"), to.get("book_type_id"), fromId);
        }
        requireKnown("books_listings", "book_genres", "book_genre_id", keptGenres);
        requireKnown("books_listings", "book_types", "book_type_id", keptTypes);
        requireKnown("book_works", "book_genres", "book_genre_id", keptGenres);
        requireKnown("book_works", "book_types", "book_type_id", keptTypes);
        if (listings + works > 0) {
            log.info("Book genres remapped: {} listing(s), {} work(s)", listings, works);
        }
    }

    private void requireKnown(String table, String refTable, String column, Collection<String> kept) {
        List<String> used = jdbc.queryForList("SELECT DISTINCT upper(r.name) FROM " + table + " t JOIN " + refTable
                + " r ON r.id = t." + column, String.class);
        Set<String> keep = kept.stream().map(k -> k.toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
        List<String> unknown = used.stream().filter(n -> !keep.contains(n)).sorted().toList();
        if (!unknown.isEmpty()) {
            throw new IllegalStateException(table + "." + column + " still uses " + unknown
                    + "; add them to a genre's 'replaces' in data/books/books.json");
        }
    }

    private String json(Map<String, Object> attributes) {
        try {
            return objectMapper.writeValueAsString(attributes);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot serialize replacement attributes " + attributes, e);
        }
    }
}
