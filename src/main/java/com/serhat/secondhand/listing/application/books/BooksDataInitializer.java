package com.serhat.secondhand.listing.application.books;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.core.seed.SeedKeyNormalizer;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Seeds book reference data (types, genres, languages, formats, conditions)
 * from {@code classpath:data/books/books.json}.
 *
 * <p>Uses an <b>upsert</b> strategy with deterministic UUIDs for all entities.
 * Genre entries are keyed as {@code TYPE_KEY + "_" + GENRE_KEY} to maintain
 * the type→genre hierarchy.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BooksDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "data/books/books.json";

    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;
    private final ObjectMapper objectMapper;
    private final CatalogLegacyPruner legacyPruner;

    private final Set<String> seenTypes = new HashSet<>();
    private final Set<String> seenGenres = new HashSet<>();
    private final Set<String> seenLanguages = new HashSet<>();
    private final Set<String> seenFormats = new HashSet<>();
    private final Set<String> seenConditions = new HashSet<>();

    @Override
    public String key() {
        return "books";
    }

    @Override
    public Result<Void> run() {
        try {
            Stream.of(seenTypes, seenGenres, seenLanguages, seenFormats, seenConditions).forEach(Set::clear);
            JsonNode root = loadCatalog();
            seedTypes(root.get("types"));
            seedGenres(root.get("genres"));
            seedLanguages(root.get("languages"));
            seedFormats(root.get("formats"));
            seedConditions(root.get("conditions"));
            // genres reference types, so they go first
            legacyPruner.prune("book_genres", seenGenres, Map.of("OTHER", "OKUMA_KITABI_OTHER"));
            legacyPruner.prune("book_types", seenTypes);
            legacyPruner.prune("book_languages", seenLanguages);
            legacyPruner.prune("book_formats", seenFormats, Map.of("EBOOK", "E_BOOK"));
            legacyPruner.prune("book_conditions", seenConditions);
            log.info("Books seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Books seed failed", e);
            return Result.error("Books seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private UUID generateStableUuid(String source) {
        return UUID.nameUUIDFromBytes(source.getBytes(StandardCharsets.UTF_8));
    }

    // ── Type Seeding ────────────────────────────────────────────────────

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) return;
        for (JsonNode node : typesNode) {
            String key;
            String label;
            if (node.isObject() && node.has("key") && node.has("label")) {
                key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
                label = node.get("label").asText().trim();
            } else {
                label = node.asText().trim();
                key = SeedKeyNormalizer.toKey(label);
            }
            upsertType(key, label);
        }
    }

    private BookType upsertType(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenTypes.add(normalizedKey);
        Optional<BookType> existing = bookTypeRepository.findByNameIgnoreCase(normalizedKey);
        BookType type;
        if (existing.isPresent()) {
            type = existing.get();
            type.setNew(false);
        } else {
            type = new BookType();
            type.setId(generateStableUuid("book-type:" + normalizedKey));
            type.setName(normalizedKey);
        }
        if (!Objects.equals(type.getLabel(), label)) {
            type.setLabel(label);
            return bookTypeRepository.save(type);
        } else if (type.isNew()) {
            return bookTypeRepository.save(type);
        }
        return type;
    }

    // ── Genre Seeding (type→genre hierarchy) ────────────────────────────

    private void seedGenres(JsonNode genresNode) {
        if (genresNode == null || !genresNode.isObject()) return;

        Iterator<Map.Entry<String, JsonNode>> fields = genresNode.properties().iterator();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String typeKey = entry.getKey().trim().toUpperCase(Locale.ROOT);
            JsonNode genreNodes = entry.getValue();

            BookType type = bookTypeRepository.findByNameIgnoreCase(typeKey).orElse(null);
            if (type == null || !genreNodes.isArray()) continue;

            for (JsonNode gNode : genreNodes) {
                String subKey;
                String label;
                if (gNode.isObject() && gNode.has("key") && gNode.has("label")) {
                    subKey = gNode.get("key").asText().trim().toUpperCase(Locale.ROOT);
                    label = gNode.get("label").asText().trim();
                } else {
                    label = gNode.asText().trim();
                    subKey = SeedKeyNormalizer.toKey(label);
                }
                String genreKey = typeKey + "_" + subKey;
                upsertGenre(genreKey, label, type);
            }
        }

        // Ensure fallback OTHER genre exists
        BookType readingType = bookTypeRepository.findByNameIgnoreCase("OKUMA_KITABI")
                .or(() -> bookTypeRepository.findByNameIgnoreCase("OTHER"))
                .orElse(null);
        if (readingType != null) {
            upsertGenre("OTHER", "Other", readingType);
        }
    }

    private void upsertGenre(String key, String label, BookType type) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenGenres.add(normalizedKey);
        Optional<BookGenre> existing = bookGenreRepository.findByNameIgnoreCase(normalizedKey);
        BookGenre genre;
        if (existing.isPresent()) {
            genre = existing.get();
            genre.setNew(false);
        } else {
            genre = new BookGenre();
            genre.setId(generateStableUuid("book-genre:" + normalizedKey));
            genre.setName(normalizedKey);
        }
        boolean needsSave = genre.isNew();
        if (!Objects.equals(genre.getLabel(), label)) {
            genre.setLabel(label);
            needsSave = true;
        }
        if (genre.getBookType() == null || (type != null && !Objects.equals(genre.getBookType().getId(), type.getId()))) {
            genre.setBookType(type);
            needsSave = true;
        }
        if (needsSave) {
            bookGenreRepository.save(genre);
        }
    }

    // ── Language Seeding ────────────────────────────────────────────────

    private void seedLanguages(JsonNode languagesNode) {
        if (languagesNode == null || !languagesNode.isArray()) return;
        for (JsonNode node : languagesNode) {
            String key;
            String label;
            if (node.isObject() && node.has("key") && node.has("label")) {
                key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
                label = node.get("label").asText().trim();
            } else {
                label = node.asText().trim();
                key = SeedKeyNormalizer.toKey(label);
            }
            upsertLanguage(key, label);
        }
    }

    private void upsertLanguage(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenLanguages.add(normalizedKey);
        Optional<BookLanguage> existing = bookLanguageRepository.findByNameIgnoreCase(normalizedKey);
        BookLanguage lang;
        if (existing.isPresent()) {
            lang = existing.get();
            lang.setNew(false);
        } else {
            lang = new BookLanguage();
            lang.setId(generateStableUuid("book-language:" + normalizedKey));
            lang.setName(normalizedKey);
        }
        if (!Objects.equals(lang.getLabel(), label)) {
            lang.setLabel(label);
            bookLanguageRepository.save(lang);
        } else if (lang.isNew()) {
            bookLanguageRepository.save(lang);
        }
    }

    // ── Format Seeding ──────────────────────────────────────────────────

    private void seedFormats(JsonNode formatsNode) {
        if (formatsNode == null || !formatsNode.isArray()) return;
        for (JsonNode node : formatsNode) {
            String key;
            String label;
            if (node.isObject() && node.has("key") && node.has("label")) {
                key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
                label = node.get("label").asText().trim();
            } else {
                label = node.asText().trim();
                key = SeedKeyNormalizer.toKey(label);
            }
            upsertFormat(key, label);
        }
    }

    private void upsertFormat(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenFormats.add(normalizedKey);
        Optional<BookFormat> existing = bookFormatRepository.findByNameIgnoreCase(normalizedKey);
        BookFormat format;
        if (existing.isPresent()) {
            format = existing.get();
            format.setNew(false);
        } else {
            format = new BookFormat();
            format.setId(generateStableUuid("book-format:" + normalizedKey));
            format.setName(normalizedKey);
        }
        if (!Objects.equals(format.getLabel(), label)) {
            format.setLabel(label);
            bookFormatRepository.save(format);
        } else if (format.isNew()) {
            bookFormatRepository.save(format);
        }
    }

    // ── Condition Seeding ───────────────────────────────────────────────

    private void seedConditions(JsonNode conditionsNode) {
        if (conditionsNode == null || !conditionsNode.isArray()) return;
        for (JsonNode node : conditionsNode) {
            String key;
            String label;
            if (node.isObject() && node.has("key") && node.has("label")) {
                key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
                label = node.get("label").asText().trim();
            } else {
                label = node.asText().trim();
                key = SeedKeyNormalizer.toKey(label);
            }
            upsertCondition(key, label);
        }
    }

    private void upsertCondition(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenConditions.add(normalizedKey);
        Optional<BookCondition> existing = bookConditionRepository.findByNameIgnoreCase(normalizedKey);
        BookCondition condition;
        if (existing.isPresent()) {
            condition = existing.get();
            condition.setNew(false);
        } else {
            condition = new BookCondition();
            condition.setId(generateStableUuid("book-condition:" + normalizedKey));
            condition.setName(normalizedKey);
        }
        if (!Objects.equals(condition.getLabel(), label)) {
            condition.setLabel(label);
            bookConditionRepository.save(condition);
        } else if (condition.isNew()) {
            bookConditionRepository.save(condition);
        }
    }
}
