package com.serhat.secondhand.listing.validation.books;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BooksValidationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final BooksHierarchyValidator hierarchyValidator = new BooksHierarchyValidator();
    private final BooksRequiredFieldsValidator requiredFieldsValidator = new BooksRequiredFieldsValidator();

    @Test
    @DisplayName("books.json catalog has all types, genres, languages, formats, and conditions in valid key/label format")
    void testBooksCatalogStructure() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/books/books.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        // 1. Types
        JsonNode types = root.get("types");
        assertThat(types).isNotNull();
        assertThat(types.isArray()).isTrue();
        assertThat(types.size()).isGreaterThanOrEqualTo(16);

        Set<String> typeKeys = new HashSet<>();
        for (JsonNode t : types) {
            assertThat(t.has("key")).isTrue();
            assertThat(t.has("label")).isTrue();
            String key = t.get("key").asText();
            String label = t.get("label").asText();
            assertThat(key).matches("^[A-Z0-9_]+$");
            assertThat(label).isNotBlank();
            typeKeys.add(key);
        }

        // Verify the 6 new audit types exist
        assertThat(typeKeys).contains(
                "TARIH_VE_ARASTIRMA",
                "FELSEFE_VE_SOSYOLOJI",
                "SANAT_VE_TASARIM",
                "HOBI_VE_YASAM",
                "DERGI_VE_SURELI_YAYIN",
                "OTHER"
        );

        // 2. Genres
        JsonNode genres = root.get("genres");
        assertThat(genres).isNotNull();
        assertThat(genres.isObject()).isTrue();

        Iterator<Map.Entry<String, JsonNode>> fields = genres.properties().iterator();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String typeKey = entry.getKey();
            assertThat(typeKeys).as("Genre type key %s must exist in types", typeKey).contains(typeKey);

            JsonNode list = entry.getValue();
            assertThat(list.isArray()).isTrue();
            assertThat(list.size()).isGreaterThanOrEqualTo(3);

            boolean hasOther = false;
            for (JsonNode g : list) {
                assertThat(g.has("key")).isTrue();
                assertThat(g.has("label")).isTrue();
                String gKey = g.get("key").asText();
                String gLabel = g.get("label").asText();
                assertThat(gKey).matches("^[A-Z0-9_]+$");
                assertThat(gLabel).isNotBlank();
                if ("OTHER".equals(gKey)) {
                    hasOther = true;
                }
            }
            assertThat(hasOther).as("Type %s must have an 'OTHER' genre", typeKey).isTrue();
        }

        // 3. Languages
        JsonNode languages = root.get("languages");
        assertThat(languages).isNotNull();
        assertThat(languages.isArray()).isTrue();
        for (JsonNode lang : languages) {
            assertThat(lang.has("key")).isTrue();
            assertThat(lang.has("label")).isTrue();
            assertThat(lang.get("key").asText()).matches("^[A-Z0-9_]+$");
            assertThat(lang.get("label").asText()).isNotBlank();
        }

        // 4. Formats
        JsonNode formats = root.get("formats");
        assertThat(formats).isNotNull();
        assertThat(formats.isArray()).isTrue();
        Set<String> formatKeys = new HashSet<>();
        for (JsonNode fmt : formats) {
            assertThat(fmt.has("key")).isTrue();
            assertThat(fmt.has("label")).isTrue();
            String key = fmt.get("key").asText();
            assertThat(key).matches("^[A-Z0-9_]+$");
            assertThat(key).doesNotContain("(", ")", "/");
            assertThat(fmt.get("label").asText()).isNotBlank();
            formatKeys.add(key);
        }
        assertThat(formatKeys).contains("HARDCOVER", "PAPERBACK", "SPIRAL", "POCKET", "E_BOOK", "AUDIOBOOK");

        // 5. Conditions
        JsonNode conditions = root.get("conditions");
        assertThat(conditions).isNotNull();
        assertThat(conditions.isArray()).isTrue();
        Set<String> conditionKeys = new HashSet<>();
        for (JsonNode cond : conditions) {
            assertThat(cond.has("key")).isTrue();
            assertThat(cond.has("label")).isTrue();
            String key = cond.get("key").asText();
            assertThat(key).matches("^[A-Z0-9_]+$");
            assertThat(key).doesNotContain("(", ")", "/");
            assertThat(cond.get("label").asText()).isNotBlank();
            conditionKeys.add(key);
        }
        assertThat(conditionKeys).contains("NEW", "LIKE_NEW", "GOOD", "ACCEPTABLE", "WORN");
    }

    @Test
    @DisplayName("BooksHierarchyValidator succeeds when genre belongs to selected book type")
    void testHierarchyValidator_Success() {
        UUID typeId = UUID.nameUUIDFromBytes("book-type:OKUMA_KITABI".getBytes(StandardCharsets.UTF_8));
        BookType type = new BookType();
        type.setId(typeId);
        type.setName("OKUMA_KITABI");

        BookGenre genre = new BookGenre();
        genre.setId(UUID.nameUUIDFromBytes("book-genre:OKUMA_KITABI_ROMAN".getBytes(StandardCharsets.UTF_8)));
        genre.setName("OKUMA_KITABI_ROMAN");
        genre.setBookType(type);

        BooksListing listing = new BooksListing();
        listing.setBookType(type);
        listing.setGenre(genre);

        Result<Void> result = hierarchyValidator.validate(listing);
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    @DisplayName("BooksHierarchyValidator fails when genre belongs to another book type")
    void testHierarchyValidator_FailureOnMismatch() {
        BookType typeA = new BookType();
        typeA.setId(UUID.randomUUID());
        typeA.setName("OKUMA_KITABI");

        BookType typeB = new BookType();
        typeB.setId(UUID.randomUUID());
        typeB.setName("DERS_KITABI");

        BookGenre genreB = new BookGenre();
        genreB.setId(UUID.randomUUID());
        genreB.setName("DERS_KITABI_MATEMATIK");
        genreB.setBookType(typeB);

        BooksListing listing = new BooksListing();
        listing.setBookType(typeA);
        listing.setGenre(genreB);

        Result<Void> result = hierarchyValidator.validate(listing);
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("BOOK_GENRE_TYPE_MISMATCH");
    }

    @Test
    @DisplayName("BooksRequiredFieldsValidator enforces mandatory book fields")
    void testRequiredFieldsValidator() {
        BooksListing listing = new BooksListing();
        Result<Void> res1 = requiredFieldsValidator.validate(listing);
        assertThat(res1.getErrorCode()).isEqualTo("BOOK_TYPE_REQUIRED");

        BookType type = new BookType();
        type.setId(UUID.randomUUID());
        listing.setBookType(type);

        Result<Void> res2 = requiredFieldsValidator.validate(listing);
        assertThat(res2.getErrorCode()).isEqualTo("BOOK_GENRE_REQUIRED");

        BookGenre genre = new BookGenre();
        genre.setId(UUID.randomUUID());
        genre.setBookType(type);
        listing.setGenre(genre);

        Result<Void> res3 = requiredFieldsValidator.validate(listing);
        assertThat(res3.getErrorCode()).isEqualTo("BOOK_LANGUAGE_REQUIRED");

        BookLanguage lang = new BookLanguage();
        lang.setId(UUID.randomUUID());
        listing.setLanguage(lang);

        Result<Void> res4 = requiredFieldsValidator.validate(listing);
        assertThat(res4.getErrorCode()).isEqualTo("BOOK_FORMAT_REQUIRED");

        BookFormat fmt = new BookFormat();
        fmt.setId(UUID.randomUUID());
        listing.setFormat(fmt);

        Result<Void> res5 = requiredFieldsValidator.validate(listing);
        assertThat(res5.getErrorCode()).isEqualTo("BOOK_CONDITION_REQUIRED");

        BookCondition cond = new BookCondition();
        cond.setId(UUID.randomUUID());
        listing.setCondition(cond);

        Result<Void> res6 = requiredFieldsValidator.validate(listing);
        assertThat(res6.getErrorCode()).isEqualTo("BOOK_AUTHOR_REQUIRED");

        listing.setAuthor("Fyodor Dostoyevski");
        Result<Void> res7 = requiredFieldsValidator.validate(listing);
        assertThat(res7.getErrorCode()).isEqualTo("BOOK_PUBLICATION_YEAR_INVALID");

        listing.setPublicationYear(1866);
        Result<Void> res8 = requiredFieldsValidator.validate(listing);
        assertThat(res8.getErrorCode()).isEqualTo("BOOK_PAGE_COUNT_INVALID");

        listing.setPageCount(672);
        Result<Void> res9 = requiredFieldsValidator.validate(listing);
        assertThat(res9.isSuccess()).isTrue();
    }

    @Test
    @DisplayName("Entities implement Persistable<UUID> with deterministic UUID and isNew management")
    void testPersistableImplementation() {
        UUID stableId = UUID.nameUUIDFromBytes("book-type:ROMAN".getBytes(StandardCharsets.UTF_8));
        BookType type = new BookType();
        type.setId(stableId);
        assertThat(type.isNew()).isTrue();
        type.setNew(false);
        assertThat(type.isNew()).isFalse();
        assertThat(type.getId()).isEqualTo(stableId);
    }
}
