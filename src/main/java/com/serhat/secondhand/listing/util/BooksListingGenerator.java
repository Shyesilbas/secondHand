package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.books.*;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Gerçekçi ve mantıklı books listing'ler oluşturan generator sınıfı.
 * Genre'e göre fiyat aralıkları, mantıklı kombinasyonlar ve gerçekçi açıklamalar üretir.
 */
@Component
@Slf4j
public class BooksListingGenerator {

    private static final Random random = new Random();
    
    // Genre'e göre fiyat aralıkları (TRY cinsinden)
    private static final Map<BookGenre, PriceRange> GENRE_PRICE_RANGES = new HashMap<>();
    
    // Genre'e göre uygun format'lar
    private static final Map<BookGenre, List<BookFormat>> GENRE_FORMATS = new HashMap<>();
    
    // Genre'e göre yazar örnekleri
    private static final Map<BookGenre, List<String>> GENRE_AUTHORS = new HashMap<>();
    
    // Genre'e göre kitap başlıkları
    private static final Map<BookGenre, List<String>> GENRE_TITLES = new HashMap<>();
    
    // Türk şehirleri ve ilçeleri
    private static final Map<String, List<String>> CITIES_DISTRICTS = new HashMap<>();
    
    // Açıklama şablonları
    private static final List<String> DESCRIPTION_TEMPLATES = new ArrayList<>();
    
    static {
        initializeGenrePriceRanges();
        initializeGenreFormats();
        initializeGenreAuthors();
        initializeGenreTitles();
        initializeCitiesDistricts();
        initializeDescriptionTemplates();
    }
    
    private static void initializeGenrePriceRanges() {
        // Akademik ve özel kitaplar daha pahalı
        GENRE_PRICE_RANGES.put(BookGenre.SCIENCE, new PriceRange(100, 500));
        GENRE_PRICE_RANGES.put(BookGenre.NON_FICTION, new PriceRange(80, 400));
        GENRE_PRICE_RANGES.put(BookGenre.HISTORY, new PriceRange(70, 350));
        GENRE_PRICE_RANGES.put(BookGenre.BIOGRAPHY, new PriceRange(60, 300));
        
        // Kurgu kitapları
        GENRE_PRICE_RANGES.put(BookGenre.FICTION, new PriceRange(50, 250));
        GENRE_PRICE_RANGES.put(BookGenre.FANTASY, new PriceRange(60, 300));
        
        // Çocuk kitapları
        GENRE_PRICE_RANGES.put(BookGenre.CHILDREN, new PriceRange(30, 150));
        
        // Diğer
        GENRE_PRICE_RANGES.put(BookGenre.OTHER, new PriceRange(40, 200));
    }
    
    private static void initializeGenreFormats() {
        GENRE_FORMATS.put(BookGenre.SCIENCE, Arrays.asList(BookFormat.HARDCOVER, BookFormat.PAPERBACK));
        GENRE_FORMATS.put(BookGenre.NON_FICTION, Arrays.asList(BookFormat.HARDCOVER, BookFormat.PAPERBACK, BookFormat.EBOOK));
        GENRE_FORMATS.put(BookGenre.FICTION, Arrays.asList(BookFormat.PAPERBACK, BookFormat.EBOOK));
        GENRE_FORMATS.put(BookGenre.FANTASY, Arrays.asList(BookFormat.PAPERBACK, BookFormat.HARDCOVER));
        GENRE_FORMATS.put(BookGenre.HISTORY, Arrays.asList(BookFormat.HARDCOVER, BookFormat.PAPERBACK));
        GENRE_FORMATS.put(BookGenre.BIOGRAPHY, Arrays.asList(BookFormat.HARDCOVER, BookFormat.PAPERBACK));
        GENRE_FORMATS.put(BookGenre.CHILDREN, Arrays.asList(BookFormat.HARDCOVER, BookFormat.PAPERBACK));
        GENRE_FORMATS.put(BookGenre.OTHER, Arrays.asList(BookFormat.PAPERBACK, BookFormat.EBOOK));
    }
    
    private static void initializeGenreAuthors() {
        GENRE_AUTHORS.put(BookGenre.FICTION, Arrays.asList(
            "Orhan Pamuk", "Elif Şafak", "Ahmet Ümit", "İhsan Oktay Anar",
            "Yaşar Kemal", "Reşat Nuri Güntekin", "Halide Edib Adıvar"
        ));
        GENRE_AUTHORS.put(BookGenre.FANTASY, Arrays.asList(
            "J.K. Rowling", "J.R.R. Tolkien", "George R.R. Martin",
            "Andrzej Sapkowski", "Brandon Sanderson"
        ));
        GENRE_AUTHORS.put(BookGenre.SCIENCE, Arrays.asList(
            "Stephen Hawking", "Carl Sagan", "Richard Dawkins",
            "Neil deGrasse Tyson", "Michio Kaku"
        ));
        GENRE_AUTHORS.put(BookGenre.HISTORY, Arrays.asList(
            "İlber Ortaylı", "Halil İnalcık", "Emrah Safa Gürkan",
            "Celal Şengör", "Erhan Afyoncu"
        ));
        GENRE_AUTHORS.put(BookGenre.BIOGRAPHY, Arrays.asList(
            "Walter Isaacson", "Doris Kearns Goodwin", "Ron Chernow"
        ));
        GENRE_AUTHORS.put(BookGenre.NON_FICTION, Arrays.asList(
            "Malcolm Gladwell", "Yuval Noah Harari", "Jared Diamond"
        ));
        GENRE_AUTHORS.put(BookGenre.CHILDREN, Arrays.asList(
            "Roald Dahl", "J.K. Rowling", "Astrid Lindgren"
        ));
    }
    
    private static void initializeGenreTitles() {
        GENRE_TITLES.put(BookGenre.FICTION, Arrays.asList(
            "Kırmızı Saçlı Kadın", "Aşk", "Beyaz Kale", "Kara Kitap",
            "İnce Memed", "Çalıkuşu", "Sinekli Bakkal"
        ));
        GENRE_TITLES.put(BookGenre.FANTASY, Arrays.asList(
            "Harry Potter Serisi", "Yüzüklerin Efendisi", "Buz ve Ateşin Şarkısı",
            "Witcher Serisi", "Mistborn Serisi"
        ));
        GENRE_TITLES.put(BookGenre.SCIENCE, Arrays.asList(
            "Zamanın Kısa Tarihi", "Kozmos", "Gen Bencildir",
            "Astrofizik", "Geleceğin Fiziği"
        ));
        GENRE_TITLES.put(BookGenre.HISTORY, Arrays.asList(
            "Türkiye'nin Yakın Tarihi", "Osmanlı İmparatorluğu", "İstanbul'dan Sayfalar",
            "Bilimsel Düşüncenin Işığında Tarih", "Türklerin Tarihi"
        ));
    }
    
    private static void initializeCitiesDistricts() {
        CITIES_DISTRICTS.put("Istanbul", Arrays.asList(
            "Kadıköy", "Beşiktaş", "Şişli", "Beyoğlu", "Üsküdar",
            "Bakırköy", "Ataşehir", "Maltepe", "Kartal", "Pendik"
        ));
        CITIES_DISTRICTS.put("Ankara", Arrays.asList(
            "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan",
            "Etimesgut", "Altındağ", "Pursaklar"
        ));
        CITIES_DISTRICTS.put("Izmir", Arrays.asList(
            "Konak", "Bornova", "Karşıyaka", "Buca", "Bayraklı",
            "Çiğli", "Gaziemir", "Alsancak"
        ));
        CITIES_DISTRICTS.put("Bursa", Arrays.asList(
            "Osmangazi", "Nilüfer", "Yıldırım", "Mudanya"
        ));
        CITIES_DISTRICTS.put("Antalya", Arrays.asList(
            "Muratpaşa", "Konyaaltı", "Kepez", "Alanya"
        ));
    }
    
    private static void initializeDescriptionTemplates() {
        DESCRIPTION_TEMPLATES.addAll(Arrays.asList(
            "Mükemmel durumda, hiç okunmadı. Orijinal kapağı ve sayfaları yeni gibi.",
            "Çok iyi durumda, sadece bir kez okundu. Sayfalar temiz ve düzgün.",
            "İyi durumda, dikkatli okundu. Minimal kullanım izi var.",
            "Yeni gibi, etiketli. Orijinal faturası mevcut.",
            "Çok iyi durumda, düzenli bakım yapıldı. Sayfalar sararmamış.",
            "İyi durumda, normal kullanım izleri var. Okunabilir durumda.",
            "Mükemmel durumda, nadiren okundu. Orijinal ambalajı korunmuş.",
            "Çok iyi durumda, dikkatli kullanıldı. Hiç not alınmamış.",
            "İyi durumda, sayfalar tam. Küçük kullanım izleri mevcut.",
            "Mükemmel kalitede, orijinal ürün. Sadece gözden geçirildi."
        ));
    }
    
    /**
     * Rastgele bir books listing oluşturur
     */
    public BooksCreateRequest generateRandomListing() {
        BookGenre genre = getRandomGenre();
        BookFormat format = getRandomFormatForGenre(genre);
        BookLanguage language = getRandomLanguage();
        BookCondition condition = getRandomCondition();
        
        PriceRange priceRange = GENRE_PRICE_RANGES.get(genre);
        BigDecimal basePrice = generatePrice(priceRange, format, condition);
        
        String author = getRandomAuthorForGenre(genre);
        String title = generateTitle(genre, author);
        String description = generateDescription(genre, author, title, condition);
        int publicationYear = generatePublicationYear();
        int pageCount = generatePageCount(genre);
        String isbn = generateISBN();
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new BooksCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            author,
            genre,
            language,
            publicationYear,
            pageCount,
            format,
            condition,
            isbn,
            null // imageUrl
        );
    }
    
    /**
     * Belirli bir genre için listing oluşturur
     */
    public BooksCreateRequest generateForGenre(BookGenre genre) {
        BookFormat format = getRandomFormatForGenre(genre);
        BookLanguage language = getRandomLanguage();
        BookCondition condition = getRandomCondition();
        
        PriceRange priceRange = GENRE_PRICE_RANGES.get(genre);
        BigDecimal basePrice = generatePrice(priceRange, format, condition);
        
        String author = getRandomAuthorForGenre(genre);
        String title = generateTitle(genre, author);
        String description = generateDescription(genre, author, title, condition);
        int publicationYear = generatePublicationYear();
        int pageCount = generatePageCount(genre);
        String isbn = generateISBN();
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new BooksCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            author,
            genre,
            language,
            publicationYear,
            pageCount,
            format,
            condition,
            isbn,
            null
        );
    }
    
    /**
     * Belirli sayıda listing oluşturur
     */
    public List<BooksCreateRequest> generateListings(int count) {
        List<BooksCreateRequest> listings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            listings.add(generateRandomListing());
        }
        return listings;
    }
    
    // Helper methods
    
    private BookGenre getRandomGenre() {
        BookGenre[] genres = BookGenre.values();
        return genres[random.nextInt(genres.length)];
    }
    
    private BookFormat getRandomFormatForGenre(BookGenre genre) {
        List<BookFormat> formats = GENRE_FORMATS.getOrDefault(genre, 
            Arrays.asList(BookFormat.PAPERBACK, BookFormat.HARDCOVER));
        return formats.get(random.nextInt(formats.size()));
    }
    
    private BookLanguage getRandomLanguage() {
        BookLanguage[] languages = BookLanguage.values();
        // Daha fazla Türkçe ve İngilizce
        int rand = random.nextInt(100);
        if (rand < 50) return BookLanguage.TURKISH;
        if (rand < 80) return BookLanguage.ENGLISH;
        return languages[random.nextInt(languages.length)];
    }
    
    private BookCondition getRandomCondition() {
        int rand = random.nextInt(100);
        if (rand < 30) return BookCondition.NEW;
        if (rand < 60) return BookCondition.LIKE_NEW;
        if (rand < 80) return BookCondition.GOOD;
        if (rand < 95) return BookCondition.FAIR;
        return BookCondition.POOR;
    }
    
    private BigDecimal generatePrice(PriceRange range, BookFormat format, BookCondition condition) {
        // Format'a göre fiyat çarpanı
        double formatMultiplier = format == BookFormat.HARDCOVER ? 1.3 : 
                                  format == BookFormat.EBOOK ? 0.5 : 1.0;
        
        // Base price
        double basePrice = range.min + (range.max - range.min) * random.nextDouble();
        basePrice *= formatMultiplier;
        
        // Condition'a göre indirim
        double conditionDiscount = getConditionDiscount(condition);
        basePrice *= conditionDiscount;
        
        // Yuvarla
        BigDecimal price = BigDecimal.valueOf(basePrice);
        price = price.setScale(2, RoundingMode.HALF_UP);
        
        // Minimum 20 TL
        if (price.compareTo(BigDecimal.valueOf(20)) < 0) {
            price = BigDecimal.valueOf(20);
        }
        
        return price;
    }
    
    private double getConditionDiscount(BookCondition condition) {
        switch (condition) {
            case NEW: return 1.0; // %0 indirim
            case LIKE_NEW: return 0.85; // %15 indirim
            case GOOD: return 0.70; // %30 indirim
            case FAIR: return 0.50; // %50 indirim
            case POOR: return 0.30; // %70 indirim
            default: return 1.0;
        }
    }
    
    private String getRandomAuthorForGenre(BookGenre genre) {
        List<String> authors = GENRE_AUTHORS.get(genre);
        if (authors != null && !authors.isEmpty()) {
            return authors.get(random.nextInt(authors.size()));
        }
        return "Bilinmeyen Yazar";
    }
    
    private String generateTitle(BookGenre genre, String author) {
        List<String> titles = GENRE_TITLES.get(genre);
        if (titles != null && !titles.isEmpty() && random.nextBoolean()) {
            return titles.get(random.nextInt(titles.size()));
        }
        
        // Generic title
        return author + " - " + genre.getLabel() + " Kitap";
    }
    
    private String generateDescription(BookGenre genre, String author, String title, BookCondition condition) {
        String template = DESCRIPTION_TEMPLATES.get(random.nextInt(DESCRIPTION_TEMPLATES.size()));
        String conditionText = getConditionText(condition);
        
        return String.format("%s tarafından yazılan '%s' adlı %s kitap. %s %s", 
            author, title, genre.getLabel().toLowerCase(), conditionText, template);
    }
    
    private String getConditionText(BookCondition condition) {
        switch (condition) {
            case NEW: return "Yeni,";
            case LIKE_NEW: return "Yeni gibi,";
            case GOOD: return "İyi durumda,";
            case FAIR: return "Orta durumda,";
            case POOR: return "Kullanılmış,";
            default: return "";
        }
    }
    
    private int generatePublicationYear() {
        // Son 30 yıl içinde
        int currentYear = java.time.Year.now().getValue();
        return currentYear - random.nextInt(30);
    }
    
    private int generatePageCount(BookGenre genre) {
        // Genre'e göre sayfa sayısı
        switch (genre) {
            case CHILDREN:
                return 50 + random.nextInt(150); // 50-200
            case FICTION:
            case FANTASY:
                return 200 + random.nextInt(500); // 200-700
            case SCIENCE:
            case NON_FICTION:
            case HISTORY:
            case BIOGRAPHY:
                return 300 + random.nextInt(400); // 300-700
            default:
                return 200 + random.nextInt(400); // 200-600
        }
    }
    
    private String generateISBN() {
        // Basit ISBN formatı: 978-XXXX-XXXX-X
        return String.format("978-%04d-%04d-%d", 
            random.nextInt(10000), 
            random.nextInt(10000), 
            random.nextInt(10));
    }
    
    private String[] getRandomCityDistrict() {
        List<String> cities = new ArrayList<>(CITIES_DISTRICTS.keySet());
        String city = cities.get(random.nextInt(cities.size()));
        List<String> districts = CITIES_DISTRICTS.get(city);
        String district = districts.get(random.nextInt(districts.size()));
        return new String[]{city, district};
    }
    
    // Inner class for price range
    private static class PriceRange {
        final double min;
        final double max;
        
        PriceRange(double min, double max) {
            this.min = min;
            this.max = max;
        }
    }
}

