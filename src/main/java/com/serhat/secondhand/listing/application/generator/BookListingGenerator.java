package com.serhat.secondhand.listing.application.generator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.books.BooksListingService;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Builds second-hand book listings on catalog editions (data/books/catalog.json): the listing links the edition,
 * so author, publisher, year, pages and ISBN come from the catalog. Prices are claude-draft: an estimated new
 * price from the book type and page count (TRY, 2026), then condition, hardcover, past exam year and solved pages.
 * The photo is the edition's Open Library cover URL when it has one.
 */
@Component
@RequiredArgsConstructor
class BookListingGenerator {

    record Candidate(UUID editionId, String title, String authors, String publisher, String typeName, UUID typeId,
                     String genreName, UUID genreId, UUID languageId, UUID formatId, String formatName, Integer year, Integer pages,
                     String isbn, String coverUrl, Integer examYear) {
    }

    /** Estimated new price per page and floor by book type (TRY, claude-draft, late 2026). */
    private record NewPrice(double perPage, int floor) {
    }

    private static final Map<String, NewPrice> NEW_PRICE = Map.ofEntries(
            Map.entry("OKUL_KITAPLARI", new NewPrice(1.4, 350)),
            Map.entry("UNIVERSITE_VE_MESLEK", new NewPrice(1.8, 500)),
            Map.entry("SOZLUK_VE_BASVURU", new NewPrice(1.5, 300)),
            Map.entry("COCUK_KITAPLARI", new NewPrice(1.6, 180)),
            Map.entry("CIZGI_ROMAN_VE_MANGA", new NewPrice(1.8, 200)),
            Map.entry("DERGI_VE_SURELI_YAYIN", new NewPrice(2.2, 250)));
    private static final NewPrice DEFAULT_NEW_PRICE = new NewPrice(1.15, 220);

    /** Exam books: estimated new price by format (prepFormat). */
    private static final Map<String, NewPrice> EXAM_NEW_PRICE = Map.of(
            "SORU_BANKASI", new NewPrice(1.6, 450), "DENEME", new NewPrice(1.4, 300),
            "KONU_ANLATIMI", new NewPrice(1.5, 450), "YAPRAK_TEST", new NewPrice(1.5, 250),
            "OZET_VE_FORMUL", new NewPrice(1.5, 200), "CIKMIS_SORULAR", new NewPrice(1.4, 350));

    /** Title words to exam book format, first match wins (catalog exam books are claude-draft). */
    private static final List<Map.Entry<String, String>> EXAM_FORMAT_WORDS = List.of(
            Map.entry("çıkmış", "CIKMIS_SORULAR"), Map.entry("deneme", "DENEME"), Map.entry("yaprak test", "YAPRAK_TEST"),
            Map.entry("konu anlatım", "KONU_ANLATIMI"), Map.entry("özet", "OZET_VE_FORMUL"), Map.entry("notlar", "OZET_VE_FORMUL"),
            Map.entry("formül", "OZET_VE_FORMUL"), Map.entry("soru bankası", "SORU_BANKASI"));

    private static final List<Map.Entry<String, String>> EXAM_SUBJECT_WORDS = List.of(
            Map.entry("matematik", "MATEMATIK"), Map.entry("geometri", "GEOMETRI"), Map.entry("fizik", "FIZIK"),
            Map.entry("kimya", "KIMYA"), Map.entry("biyoloji", "BIYOLOJI"), Map.entry("türkçe", "TURKCE"),
            Map.entry("edebiyat", "EDEBIYAT"), Map.entry("tarih", "TARIH"), Map.entry("coğrafya", "COGRAFYA"),
            Map.entry("genel yetenek", "GENEL_YETENEK"), Map.entry("genel kültür", "GENEL_KULTUR"),
            Map.entry("eğitim bilimleri", "EGITIM_BILIMLERI"));

    private static final Map<String, String> AYT_FIELD = Map.of(
            "MATEMATIK", "SAYISAL", "GEOMETRI", "SAYISAL", "FIZIK", "SAYISAL", "KIMYA", "SAYISAL", "BIYOLOJI", "SAYISAL",
            "EDEBIYAT", "ESIT_AGIRLIK", "TARIH", "SOZEL", "COGRAFYA", "SOZEL");

    private static final List<String> SOLVABLE_FORMATS = List.of("SORU_BANKASI", "DENEME", "YAPRAK_TEST", "CIKMIS_SORULAR");

    private static final Map<String, Double> CONDITION_FACTOR = Map.of(
            "NEW", 0.8, "LIKE_NEW", 0.6, "GOOD", 0.45, "ACCEPTABLE", 0.32, "WORN", 0.2);

    private static final Map<String, String> CONDITION_WORD = Map.of(
            "NEW", "sıfır", "LIKE_NEW", "yeni gibi", "GOOD", "temiz", "ACCEPTABLE", "kullanılmış", "WORN", "yıpranmış");

    private static final String EXAM_TYPE = "SINAV_HAZIRLIK";

    private final JdbcTemplate jdbcTemplate;
    private final BooksListingService booksListingService;

    List<Candidate> candidates() {
        List<Candidate> list = jdbcTemplate.query("""
                SELECT e.id, w.title, e.publication_year, e.page_count, e.isbn, e.cover_url, e.exam_year,
                       e.book_language_id, e.book_format_id, f.name AS format_name, p.label AS publisher,
                       t.name AS type_name, t.id AS type_id, w.book_genre_id, g.name AS genre_name,
                       (SELECT string_agg(a.label, ', ' ORDER BY wa.sort_order) FROM book_work_authors wa
                          JOIN book_authors a ON a.id = wa.author_id WHERE wa.work_id = w.id) AS authors
                FROM book_editions e
                JOIN book_works w ON w.id = e.work_id
                JOIN book_types t ON t.id = w.book_type_id
                JOIN book_genres g ON g.id = w.book_genre_id
                JOIN book_formats f ON f.id = e.book_format_id
                JOIN book_publishers p ON p.id = e.publisher_id
                ORDER BY w.name, e.id
                """, (rs, i) -> new Candidate(rs.getObject("id", UUID.class), rs.getString("title"),
                rs.getString("authors"), rs.getString("publisher"), rs.getString("type_name"),
                rs.getObject("type_id", UUID.class), rs.getString("genre_name"), rs.getObject("book_genre_id", UUID.class),
                rs.getObject("book_language_id", UUID.class), rs.getObject("book_format_id", UUID.class),
                rs.getString("format_name"), (Integer) rs.getObject("publication_year"),
                (Integer) rs.getObject("page_count"), rs.getString("isbn"), rs.getString("cover_url"),
                (Integer) rs.getObject("exam_year")));
        if (list.isEmpty()) {
            throw new IllegalStateException("Book catalog is empty; run --app.seed=books first");
        }
        return list;
    }

    Map<String, UUID> conditions() {
        Map<String, UUID> ids = new HashMap<>();
        jdbcTemplate.query("SELECT id, name FROM book_conditions", rs -> {
            ids.put(rs.getString("name"), rs.getObject("id", UUID.class));
        });
        CONDITION_FACTOR.keySet().forEach(k -> {
            if (!ids.containsKey(k)) throw new IllegalStateException("Book condition " + k + " is not seeded");
        });
        return ids;
    }

    UUID create(Candidate c, Map<String, UUID> conditionIds, Long sellerId, GeneratorRandom random,
                GeneratorLocations.Place place) {
        boolean exam = EXAM_TYPE.equals(c.typeName());
        String condition = random.weighted(weights("NEW", 10, "LIKE_NEW", 35, "GOOD", 35, "ACCEPTABLE", 15, "WORN", 5));
        Map<String, Object> attributes = new LinkedHashMap<>();
        List<String> marks = usageMarks(condition, random);
        if (!marks.isEmpty()) attributes.put("usageMarks", marks);
        if (c.year() != null && c.year() < 1985 && random.chance(0.1)) attributes.put("collectorFeatures", List.of("FIRST_EDITION"));
        String solved = null;
        NewPrice np = NEW_PRICE.getOrDefault(c.typeName(), DEFAULT_NEW_PRICE);
        if (exam) {
            String lower = c.title().toLowerCase(java.util.Locale.forLanguageTag("tr"));
            String format = firstMatch(EXAM_FORMAT_WORDS, lower, "SORU_BANKASI");
            String subject = firstMatch(EXAM_SUBJECT_WORDS, lower, "KARMA");
            attributes.put("prepFormat", format);
            attributes.put("subject", subject);
            String aytField = lower.contains("sayısal") ? "SAYISAL" : AYT_FIELD.get(subject);
            if (c.genreName().equals(EXAM_TYPE + "_AYT") && aytField != null) {
                attributes.put("aytField", aytField);
            }
            if (SOLVABLE_FORMATS.contains(format)) {
                solved = "NEW".equals(condition) ? "NONE" : random.weighted(weights("NONE", 45, "PARTIAL", 40, "FULL", 15));
                attributes.put("solvedRatio", solved);
            }
            np = EXAM_NEW_PRICE.get(format);
        }
        if ("COCUK_KITAPLARI".equals(c.typeName())) {
            attributes.put("ageRange", switch (c.genreName()) {
                case "COCUK_KITAPLARI_MACERA_VE_GENCLIK" -> "AGE_13_PLUS";
                case "COCUK_KITAPLARI_ILK_OKUMA" -> "AGE_7_9";
                case "COCUK_KITAPLARI_RESIMLI_KITAP", "COCUK_KITAPLARI_BOYAMA" -> "AGE_4_6";
                default -> "AGE_10_12";
            });
        }

        int pages = c.pages() != null ? c.pages() : 250;
        double price = Math.max(np.floor(), pages * np.perPage()) * CONDITION_FACTOR.get(condition);
        if ("HARDCOVER".equals(c.formatName())) price *= 1.4;
        if (exam && c.examYear() != null && c.examYear() < Year.now().getValue()) price *= 0.45;
        if ("PARTIAL".equals(solved)) price *= 0.65;
        if ("FULL".equals(solved)) price *= 0.3;
        price *= random.between(0.9, 1.1);
        BigDecimal asking = BigDecimal.valueOf(Math.max(30, Math.round(price / 5) * 5L)).setScale(2, RoundingMode.UNNECESSARY);

        String title = c.title() + " - " + c.authors() + ", " + c.publisher() + " (" + CONDITION_WORD.get(condition) + ")";
        if (title.length() > 120) title = c.title() + " - " + c.publisher() + " (" + CONDITION_WORD.get(condition) + ")";
        BaseListingCreateRequest base = new BaseListingCreateRequest(title, description(c, condition, marks, solved),
                asking, Currency.TRY, place.cityLabel(), place.districtLabel(), place.cityKey(), place.districtKey(),
                place.neighborhoodKey(), c.coverUrl(), random.chance(0.7));
        BooksCreateRequest request = new BooksCreateRequest(base, 1, c.authors(), c.typeId(), c.genreId(),
                c.languageId(), c.year() != null ? c.year() : 2015, pages, c.formatId(), conditionIds.get(condition),
                c.isbn(), c.editionId(), null, null, attributes);
        Result<UUID> result = booksListingService.createBooksListing(request, sellerId);
        if (result.isError()) {
            throw new IllegalStateException("Generated book listing rejected (" + c.title() + "): "
                    + result.getErrorCode() + " " + result.getMessage());
        }
        return result.getData();
    }

    private static String firstMatch(List<Map.Entry<String, String>> words, String text, String fallback) {
        return words.stream().filter(e -> text.contains(e.getKey())).map(Map.Entry::getValue).findFirst().orElse(fallback);
    }

    private static List<String> usageMarks(String condition, GeneratorRandom random) {
        List<String> marks = new ArrayList<>();
        double scale = switch (condition) {
            case "NEW", "LIKE_NEW" -> 0.0;
            case "GOOD" -> 0.5;
            default -> 1.0;
        };
        if (random.chance(0.35 * scale)) marks.add("UNDERLINED");
        if (random.chance(0.2 * scale)) marks.add("MARGIN_NOTES");
        if (random.chance(0.25 * scale)) marks.add("NAME_WRITTEN");
        if (random.chance(0.3 * scale)) marks.add("DOG_EARED");
        if (random.chance(("WORN".equals(condition) ? 0.6 : 0.2) * scale)) marks.add("YELLOWED");
        return marks;
    }

    private static String description(Candidate c, String condition, List<String> marks, String solved) {
        StringBuilder d = new StringBuilder();
        d.append(c.title()).append(", ").append(c.authors()).append(". ").append(c.publisher());
        if (c.year() != null) d.append(", ").append(c.year()).append(" baskısı");
        if (c.pages() != null) d.append(", ").append(c.pages()).append(" sayfa");
        d.append(". ");
        d.append(switch (condition) {
            case "NEW" -> "Hiç okunmadı, ambalajında.";
            case "LIKE_NEW" -> "Bir kez okundu, yeni gibi.";
            case "GOOD" -> "Temiz, sayfalarda yırtık yok.";
            case "ACCEPTABLE" -> "Okunmuş, kullanım izleri var.";
            default -> "Yıpranmış ama okunabilir durumda.";
        });
        if (marks.contains("UNDERLINED")) d.append(" Bazı sayfalarda kurşun kalemle altı çizili.");
        if ("NONE".equals(solved)) d.append(" İçi hiç çözülmedi.");
        if ("PARTIAL".equals(solved)) d.append(" Bir kısmı çözüldü, cevaplar kurşun kalemle.");
        if ("FULL".equals(solved)) d.append(" Tamamı çözüldü, konu tekrarı için uygun.");
        d.append(" Kargo veya elden teslim olur.");
        return d.toString();
    }

    @SuppressWarnings("unchecked")
    private static <T> Map<T, Integer> weights(Object... keyWeightPairs) {
        Map<T, Integer> w = new LinkedHashMap<>();
        for (int i = 0; i < keyWeightPairs.length; i += 2) {
            w.put((T) keyWeightPairs[i], (Integer) keyWeightPairs[i + 1]);
        }
        return w;
    }
}
