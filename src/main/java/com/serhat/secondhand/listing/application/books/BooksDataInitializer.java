package com.serhat.secondhand.listing.application.books;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
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
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;

/**
 * Seeds book reference data (types, genres, languages, formats, conditions)
 * from {@code classpath:seed/books.json}.
 *
 * <p>Uses an <b>upsert</b> strategy for all entities.
 * Genre entries are keyed as {@code TYPE_KEY + "_" + GENRE_KEY} to maintain
 * the type→genre hierarchy.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BooksDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "seed/books.json";

    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "books";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            seedTypes(root.get("types"));
            seedGenres(root.get("genres"));
            seedLanguages(root.get("languages"));
            seedFormats(root.get("formats"));
            seedConditions(root.get("conditions"));
            log.info("Books seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Books seed failed", e);
            return Result.error("Books seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    // ── Type Seeding ────────────────────────────────────────────────────

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) return;
        for (JsonNode node : typesNode) {
            String key = node.get("key").asText();
            String label = node.get("label").asText();
            upsertType(key, label);
        }
    }

    private BookType upsertType(String key, String label) {
        Optional<BookType> existing = bookTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            BookType type = existing.get();
            type.setLabel(label);
            return bookTypeRepository.save(type);
        }
        BookType type = new BookType();
        type.setName(key);
        type.setLabel(label);
        return bookTypeRepository.save(type);
    }

    // ── Genre Seeding (type→genre hierarchy) ────────────────────────────

    private void seedGenres(JsonNode genresNode) {
        if (genresNode == null || !genresNode.isObject()) return;

        Iterator<Map.Entry<String, JsonNode>> fields = genresNode.properties().iterator();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String typeKey = entry.getKey();
            JsonNode genreLabels = entry.getValue();

            BookType type = bookTypeRepository.findByNameIgnoreCase(typeKey).orElse(null);
            if (type == null || !genreLabels.isArray()) continue;

            for (JsonNode labelNode : genreLabels) {
                String genreLabel = labelNode.asText();
                String genreKey = typeKey + "_" + SeedKeyNormalizer.toKey(genreLabel);
                upsertGenre(genreKey, genreLabel, type);
            }
        }

        // Ensure an "OTHER" genre exists (linked to Okuma Kitabı by convention)
        BookType readingType = bookTypeRepository.findByNameIgnoreCase("OKUMA_KITABI").orElse(null);
        if (readingType != null) {
            upsertGenre("OTHER", "Other", readingType);
        }
    }

    private void upsertGenre(String key, String label, BookType type) {
        Optional<BookGenre> existing = bookGenreRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            BookGenre genre = existing.get();
            genre.setLabel(label);
            bookGenreRepository.save(genre);
            return;
        }
        BookGenre genre = new BookGenre();
        genre.setName(key);
        genre.setLabel(label);
        genre.setBookType(type);
        bookGenreRepository.save(genre);
    }

    // ── Language Seeding ────────────────────────────────────────────────

    private void seedLanguages(JsonNode languagesNode) {
        if (languagesNode == null || !languagesNode.isArray()) return;
        for (JsonNode labelNode : languagesNode) {
            String label = labelNode.asText();
            String key = SeedKeyNormalizer.toKey(label);
            upsertLanguage(key, label);
        }
    }

    private void upsertLanguage(String key, String label) {
        Optional<BookLanguage> existing = bookLanguageRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            BookLanguage lang = existing.get();
            lang.setLabel(label);
            bookLanguageRepository.save(lang);
            return;
        }
        BookLanguage lang = new BookLanguage();
        lang.setName(key);
        lang.setLabel(label);
        bookLanguageRepository.save(lang);
    }

    // ── Format Seeding ──────────────────────────────────────────────────

    private void seedFormats(JsonNode formatsNode) {
        if (formatsNode == null || !formatsNode.isArray()) return;
        for (JsonNode labelNode : formatsNode) {
            String label = labelNode.asText();
            String key = SeedKeyNormalizer.toKey(label);
            upsertFormat(key, label);
        }
    }

    private void upsertFormat(String key, String label) {
        Optional<BookFormat> existing = bookFormatRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            BookFormat format = existing.get();
            format.setLabel(label);
            bookFormatRepository.save(format);
            return;
        }
        BookFormat format = new BookFormat();
        format.setName(key);
        format.setLabel(label);
        bookFormatRepository.save(format);
    }

    // ── Condition Seeding ───────────────────────────────────────────────

    private void seedConditions(JsonNode conditionsNode) {
        if (conditionsNode == null || !conditionsNode.isArray()) return;
        for (JsonNode labelNode : conditionsNode) {
            String label = labelNode.asText();
            String key = SeedKeyNormalizer.toKey(label);
            upsertCondition(key, label);
        }
    }

    private void upsertCondition(String key, String label) {
        Optional<BookCondition> existing = bookConditionRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            BookCondition condition = existing.get();
            condition.setLabel(label);
            bookConditionRepository.save(condition);
            return;
        }
        BookCondition condition = new BookCondition();
        condition.setName(key);
        condition.setLabel(label);
        bookConditionRepository.save(condition);
    }
}
