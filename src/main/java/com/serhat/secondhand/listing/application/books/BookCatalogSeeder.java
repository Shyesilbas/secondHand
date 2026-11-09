package com.serhat.secondhand.listing.application.books;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookAuthor;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookEdition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookPublisher;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookWork;
import com.serhat.secondhand.listing.domain.repository.books.BookAuthorRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookEditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookPublisherRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookWorkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Seeds the book catalog (authors, publishers, works, editions) from {@code data/books/catalog.json}; runs as part
 * of the {@code books} seed after types, genres, languages and formats. Unknown keys, an invalid ISBN or a missing
 * {@code source} fail the seed. Editions and works that left the file are deleted unless a listing points at the
 * edition; authors and publishers through {@link CatalogLegacyPruner}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
class BookCatalogSeeder {

    private static final String PATH = "data/books/catalog.json";
    private static final Set<String> SOURCES = Set.of("claude-draft", "verified");

    record Catalog(List<Entry> publishers, List<Entry> authors, List<Work> works) {
    }

    record Entry(String key, String label) {
    }

    record Work(String key, String title, String type, String genre, List<String> authors, String originalLanguage,
                String source, List<Edition> editions) {
    }

    record Edition(String isbn, String publisher, Integer year, Integer pages, String format, String language,
                   String translator, String cover, Integer examYear, String source) {
    }

    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final CatalogLegacyPruner legacyPruner;
    private final BookAuthorRepository authorRepository;
    private final BookPublisherRepository publisherRepository;
    private final BookWorkRepository workRepository;
    private final BookEditionRepository editionRepository;
    private final BookTypeRepository typeRepository;
    private final BookGenreRepository genreRepository;
    private final BookLanguageRepository languageRepository;
    private final BookFormatRepository formatRepository;

    void seed() {
        Catalog catalog = load();
        Map<String, BookAuthor> authors = upsertEntries(catalog.authors(), "book-author:", authorRepository::findAllById,
                BookAuthor::new, authorRepository::saveAll);
        Map<String, BookPublisher> publishers = upsertEntries(catalog.publishers(), "book-publisher:",
                publisherRepository::findAllById, BookPublisher::new, publisherRepository::saveAll);
        Map<String, BookType> types = byName(typeRepository.findAll(), BookType::getName);
        Map<String, BookGenre> genres = byName(genreRepository.findAll(), BookGenre::getName);
        Map<String, BookLanguage> languages = byName(languageRepository.findAll(), BookLanguage::getName);
        Map<String, BookFormat> formats = byName(formatRepository.findAll(), BookFormat::getName);

        Set<UUID> keptWorks = new HashSet<>();
        Set<UUID> keptEditions = new HashSet<>();
        Set<String> isbns = new HashSet<>();
        int editionCount = 0;
        for (Work w : catalog.works()) {
            String where = "work " + w.key();
            UUID workId = id("book-work:" + w.key());
            BookWork work = workRepository.findById(workId).orElse(null);
            if (work == null) {
                work = new BookWork();
                work.setId(workId);
            } else {
                work.setNew(false);
            }
            work.setName(w.key());
            work.setTitle(require(w.title(), where + " title"));
            work.setBookType(lookup(types, w.type(), where + " type"));
            work.setGenre(lookup(genres, w.type() + "_" + w.genre(), where + " genre"));
            work.setOriginalLanguage(w.originalLanguage() == null ? null : lookup(languages, w.originalLanguage(), where + " originalLanguage"));
            work.setSource(source(w.source(), where));
            List<BookAuthor> workAuthors = new ArrayList<>();
            for (String a : w.authors() == null ? List.<String>of() : w.authors()) {
                workAuthors.add(lookup(authors, a, where + " author"));
            }
            if (workAuthors.isEmpty()) {
                throw new IllegalStateException(PATH + ": " + where + " has no authors");
            }
            work.getAuthors().clear();
            work.getAuthors().addAll(workAuthors);
            work = workRepository.save(work);
            keptWorks.add(work.getId());

            if (w.editions() == null || w.editions().isEmpty()) {
                throw new IllegalStateException(PATH + ": " + where + " has no editions");
            }
            for (Edition e : w.editions()) {
                String isbn = null;
                if (e.isbn() != null) {
                    isbn = Isbn.toIsbn13(e.isbn()).filter(e.isbn()::equals).orElseThrow(() ->
                            new IllegalStateException(PATH + ": " + where + " has an invalid ISBN-13 " + e.isbn()));
                    if (!isbns.add(isbn)) {
                        throw new IllegalStateException(PATH + ": duplicate ISBN " + isbn);
                    }
                }
                UUID editionId = id("book-edition:" + (isbn != null ? isbn : w.key() + ":" + e.publisher() + ":" + e.year()));
                if (!keptEditions.add(editionId)) {
                    throw new IllegalStateException(PATH + ": " + where + " lists the same edition twice (" + e.publisher() + " " + e.year() + ")");
                }
                BookEdition edition = editionRepository.findById(editionId).orElseGet(BookEdition::new);
                edition.setNew(edition.getId() == null);
                edition.setId(editionId);
                edition.setWork(work);
                edition.setIsbn(isbn);
                edition.setPublisher(lookup(publishers, e.publisher(), where + " publisher"));
                edition.setPublicationYear(e.year());
                edition.setPageCount(e.pages());
                edition.setFormat(lookup(formats, e.format(), where + " format"));
                edition.setLanguage(lookup(languages, e.language(), where + " language"));
                edition.setTranslator(e.translator());
                edition.setCoverUrl(e.cover());
                edition.setExamYear(e.examYear());
                edition.setSource(source(e.source(), where + " edition"));
                if (e.pages() != null && e.pages() <= 0 || e.year() != null && (e.year() < 1450 || e.year() > 2100)) {
                    throw new IllegalStateException(PATH + ": " + where + " has an invalid year or page count");
                }
                editionRepository.save(edition);
                editionCount++;
            }
        }
        editionRepository.flush();
        pruneEditionsAndWorks(keptEditions, keptWorks);
        legacyPruner.prune("book_authors", authors.keySet());
        legacyPruner.prune("book_publishers", publishers.keySet());
        int synced = syncLinkedListingTypes();
        log.info("Book catalog: {} works, {} editions, {} authors, {} publishers; {} linked listing(s) moved to their work's type/genre",
                catalog.works().size(), editionCount, authors.size(), publishers.size(), synced);
    }

    /** Listings linked to an edition follow their work when the catalog moves it to another type or genre. */
    private int syncLinkedListingTypes() {
        return jdbcTemplate.update("""
                UPDATE books_listings b SET book_type_id = w.book_type_id, book_genre_id = w.book_genre_id
                FROM book_editions e JOIN book_works w ON w.id = e.work_id
                WHERE b.edition_id = e.id
                  AND (b.book_type_id <> w.book_type_id OR b.book_genre_id <> w.book_genre_id)
                """);
    }

    private Catalog load() {
        Catalog catalog;
        try (InputStream is = new ClassPathResource(PATH).getInputStream()) {
            catalog = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).readValue(is, Catalog.class);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + PATH, e);
        }
        if (catalog.works() == null || catalog.works().isEmpty() || catalog.authors() == null || catalog.publishers() == null) {
            throw new IllegalStateException(PATH + " needs publishers, authors and works");
        }
        return catalog;
    }

    private <T extends com.serhat.secondhand.listing.domain.entity.enums.common.Labelable & org.springframework.data.domain.Persistable<UUID>>
    Map<String, T> upsertEntries(List<Entry> entries, String prefix, Function<List<UUID>, List<T>> findAll,
                                 java.util.function.Supplier<T> factory, Function<List<T>, List<T>> saveAll) {
        Map<String, UUID> ids = new HashMap<>();
        for (Entry e : entries) {
            if (e.key() == null || e.label() == null || ids.put(e.key(), id(prefix + e.key())) != null) {
                throw new IllegalStateException(PATH + ": missing or duplicate key " + e.key() + " (" + prefix + ")");
            }
        }
        Map<UUID, T> existing = findAll.apply(new ArrayList<>(ids.values())).stream()
                .collect(Collectors.toMap(T::getId, Function.identity()));
        List<T> toSave = new ArrayList<>();
        for (Entry e : entries) {
            T row = existing.get(ids.get(e.key()));
            if (row == null) {
                row = factory.get();
                setIdNameLabel(row, ids.get(e.key()), e.key(), e.label(), true);
                toSave.add(row);
            } else if (!e.label().equals(row.getLabel())) {
                setIdNameLabel(row, row.getId(), e.key(), e.label(), false);
                toSave.add(row);
            }
        }
        saveAll.apply(toSave);
        Map<String, T> byKey = new HashMap<>();
        findAll.apply(new ArrayList<>(ids.values())).forEach(r -> byKey.put(r.getName(), r));
        return byKey;
    }

    private static void setIdNameLabel(Object row, UUID id, String name, String label, boolean isNew) {
        if (row instanceof BookAuthor a) {
            a.setId(id); a.setName(name); a.setLabel(label); a.setNew(isNew);
        } else if (row instanceof BookPublisher p) {
            p.setId(id); p.setName(name); p.setLabel(label); p.setNew(isNew);
        }
    }

    private void pruneEditionsAndWorks(Set<UUID> keptEditions, Set<UUID> keptWorks) {
        List<UUID> stale = jdbcTemplate.queryForList("SELECT id FROM book_editions", UUID.class).stream()
                .filter(id -> !keptEditions.contains(id)).toList();
        int deleted = 0;
        for (UUID id : stale) {
            Integer refs = jdbcTemplate.queryForObject("SELECT count(*) FROM books_listings WHERE edition_id = ?", Integer.class, id);
            if (refs != null && refs > 0) {
                log.warn("Keeping book edition {} that left the catalog: {} listing(s) point at it", id, refs);
                continue;
            }
            deleted += jdbcTemplate.update("DELETE FROM book_editions WHERE id = ?", id);
        }
        int works = 0;
        for (UUID id : jdbcTemplate.queryForList("SELECT id FROM book_works", UUID.class)) {
            if (!keptWorks.contains(id)) {
                Integer editions = jdbcTemplate.queryForObject("SELECT count(*) FROM book_editions WHERE work_id = ?", Integer.class, id);
                if (editions != null && editions == 0) {
                    works += jdbcTemplate.update("DELETE FROM book_works WHERE id = ?", id);
                }
            }
        }
        if (deleted + works > 0) {
            log.info("Pruned {} book edition(s) and {} work(s) that left the catalog", deleted, works);
        }
    }

    private static <T> Map<String, T> byName(List<T> rows, Function<T, String> name) {
        return rows.stream().collect(Collectors.toMap(name, Function.identity()));
    }

    private static <T> T lookup(Map<String, T> rows, String key, String where) {
        T row = key == null ? null : rows.get(key);
        if (row == null) {
            throw new IllegalStateException(PATH + ": " + where + " '" + key + "' is not in the catalog");
        }
        return row;
    }

    private static String require(String value, String where) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(PATH + ": " + where + " is missing");
        }
        return value;
    }

    private static String source(String source, String where) {
        if (!SOURCES.contains(source)) {
            throw new IllegalStateException(PATH + ": " + where + " needs source claude-draft or verified, got " + source);
        }
        return source;
    }

    private static UUID id(String key) {
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));
    }
}
