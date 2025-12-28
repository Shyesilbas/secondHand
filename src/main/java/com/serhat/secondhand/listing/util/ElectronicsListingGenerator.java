package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Gerçekçi ve mantıklı electronics listing'ler oluşturan generator sınıfı.
 * Brand'e göre fiyat aralıkları, mantıklı kombinasyonlar ve gerçekçi açıklamalar üretir.
 */
@Component
@Slf4j
public class ElectronicsListingGenerator {

    private static final Random random = new Random();
    
    // Brand'e göre fiyat aralıkları (TRY cinsinden)
    private static final Map<ElectronicBrand, PriceRange> BRAND_PRICE_RANGES = new HashMap<>();
    
    // Brand'e göre uygun electronic type'lar
    private static final Map<ElectronicBrand, List<ElectronicType>> BRAND_TYPES = new HashMap<>();
    
    // Type'a göre uygun renkler
    private static final Map<ElectronicType, List<Color>> TYPE_COLORS = new HashMap<>();
    
    // Type'a göre model örnekleri
    private static final Map<String, List<String>> TYPE_MODELS = new HashMap<>();
    
    // Türk şehirleri ve ilçeleri
    private static final Map<String, List<String>> CITIES_DISTRICTS = new HashMap<>();
    
    // Açıklama şablonları
    private static final List<String> DESCRIPTION_TEMPLATES = new ArrayList<>();
    
    static {
        initializeBrandPriceRanges();
        initializeBrandTypes();
        initializeTypeColors();
        initializeTypeModels();
        initializeCitiesDistricts();
        initializeDescriptionTemplates();
    }
    
    private static void initializeBrandPriceRanges() {
        // Premium markalar
        BRAND_PRICE_RANGES.put(ElectronicBrand.APPLE, new PriceRange(5000, 80000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.SONY, new PriceRange(3000, 50000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.MICROSOFT, new PriceRange(4000, 60000));
        
        // Orta-üst segment
        BRAND_PRICE_RANGES.put(ElectronicBrand.SAMSUNG, new PriceRange(2000, 40000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.LG, new PriceRange(1500, 30000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.ASUS, new PriceRange(1500, 25000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.GOOGLE, new PriceRange(3000, 35000));
        
        // Orta segment
        BRAND_PRICE_RANGES.put(ElectronicBrand.XIAOMI, new PriceRange(500, 15000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.HUAWEI, new PriceRange(800, 20000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.PHILLIPS, new PriceRange(600, 12000));
        
        // Diğer
        BRAND_PRICE_RANGES.put(ElectronicBrand.FUJITSU, new PriceRange(1000, 15000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.OKI, new PriceRange(500, 8000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.BENQ, new PriceRange(800, 10000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.KODAK, new PriceRange(300, 5000));
        BRAND_PRICE_RANGES.put(ElectronicBrand.NIKON, new PriceRange(2000, 30000));
    }
    
    private static void initializeBrandTypes() {
        // Apple - premium ürünler
        BRAND_TYPES.put(ElectronicBrand.APPLE, Arrays.asList(
            ElectronicType.MOBILE_PHONE, ElectronicType.LAPTOP, ElectronicType.TABLET,
            ElectronicType.HEADPHONES, ElectronicType.SPEAKER
        ));
        
        // Samsung - geniş ürün yelpazesi
        BRAND_TYPES.put(ElectronicBrand.SAMSUNG, Arrays.asList(
            ElectronicType.MOBILE_PHONE, ElectronicType.LAPTOP, ElectronicType.TV,
            ElectronicType.TABLET, ElectronicType.AIR_CONDITIONER, ElectronicType.WASHING_MACHINE
        ));
        
        // Sony - elektronik ve eğlence
        BRAND_TYPES.put(ElectronicBrand.SONY, Arrays.asList(
            ElectronicType.TV, ElectronicType.HEADPHONES, ElectronicType.SPEAKER,
            ElectronicType.CAMERA, ElectronicType.GAMES_CONSOLE
        ));
        
        // Microsoft - bilgisayar ve tablet
        BRAND_TYPES.put(ElectronicBrand.MICROSOFT, Arrays.asList(
            ElectronicType.LAPTOP, ElectronicType.TABLET, ElectronicType.GAMES_CONSOLE
        ));
        
        // LG - ev aletleri ve TV
        BRAND_TYPES.put(ElectronicBrand.LG, Arrays.asList(
            ElectronicType.TV, ElectronicType.AIR_CONDITIONER, ElectronicType.WASHING_MACHINE,
            ElectronicType.KITCHENARY
        ));
        
        // ASUS - bilgisayar
        BRAND_TYPES.put(ElectronicBrand.ASUS, Arrays.asList(
            ElectronicType.LAPTOP, ElectronicType.MOBILE_PHONE, ElectronicType.TABLET
        ));
        
        // Google - telefon ve tablet
        BRAND_TYPES.put(ElectronicBrand.GOOGLE, Arrays.asList(
            ElectronicType.MOBILE_PHONE, ElectronicType.TABLET, ElectronicType.SPEAKER
        ));
        
        // Xiaomi - geniş yelpaze
        BRAND_TYPES.put(ElectronicBrand.XIAOMI, Arrays.asList(
            ElectronicType.MOBILE_PHONE, ElectronicType.LAPTOP, ElectronicType.TV,
            ElectronicType.TABLET, ElectronicType.AIR_CONDITIONER
        ));
        
        // Huawei - telefon ve tablet
        BRAND_TYPES.put(ElectronicBrand.HUAWEI, Arrays.asList(
            ElectronicType.MOBILE_PHONE, ElectronicType.LAPTOP, ElectronicType.TABLET
        ));
        
        // Nikon - kamera
        BRAND_TYPES.put(ElectronicBrand.NIKON, Arrays.asList(
            ElectronicType.CAMERA
        ));
        
        // Kodak - kamera
        BRAND_TYPES.put(ElectronicBrand.KODAK, Arrays.asList(
            ElectronicType.CAMERA
        ));
        
        // Diğer markalar için genel tipler
        BRAND_TYPES.put(ElectronicBrand.PHILLIPS, Arrays.asList(
            ElectronicType.TV, ElectronicType.AIR_CONDITIONER, ElectronicType.HEADPHONES
        ));
    }
    
    private static void initializeTypeColors() {
        TYPE_COLORS.put(ElectronicType.MOBILE_PHONE, Arrays.asList(
            Color.BLACK, Color.WHITE, Color.SILVER, Color.BLUE, Color.GRAY
        ));
        TYPE_COLORS.put(ElectronicType.LAPTOP, Arrays.asList(
            Color.BLACK, Color.SILVER, Color.GRAY, Color.WHITE
        ));
        TYPE_COLORS.put(ElectronicType.TV, Arrays.asList(
            Color.BLACK, Color.SILVER, Color.GRAY
        ));
        TYPE_COLORS.put(ElectronicType.TABLET, Arrays.asList(
            Color.BLACK, Color.WHITE, Color.SILVER, Color.GRAY
        ));
        TYPE_COLORS.put(ElectronicType.HEADPHONES, Arrays.asList(
            Color.BLACK, Color.WHITE, Color.BLUE, Color.RED
        ));
        TYPE_COLORS.put(ElectronicType.SPEAKER, Arrays.asList(
            Color.BLACK, Color.WHITE, Color.BLUE, Color.RED, Color.GRAY
        ));
    }
    
    private static void initializeTypeModels() {
        TYPE_MODELS.put("APPLE_MOBILE_PHONE", Arrays.asList(
            "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro", "iPhone 13", 
            "iPhone 12 Pro", "iPhone 12", "iPhone 11"
        ));
        TYPE_MODELS.put("APPLE_LAPTOP", Arrays.asList(
            "MacBook Pro 16", "MacBook Pro 14", "MacBook Air M2", "MacBook Air M1"
        ));
        TYPE_MODELS.put("APPLE_TABLET", Arrays.asList(
            "iPad Pro 12.9", "iPad Pro 11", "iPad Air", "iPad"
        ));
        
        TYPE_MODELS.put("SAMSUNG_MOBILE_PHONE", Arrays.asList(
            "Galaxy S23", "Galaxy S22", "Galaxy S21", "Galaxy Note 20", "Galaxy A54"
        ));
        TYPE_MODELS.put("SAMSUNG_LAPTOP", Arrays.asList(
            "Galaxy Book3 Pro", "Galaxy Book2", "Notebook 9"
        ));
        TYPE_MODELS.put("SAMSUNG_TV", Arrays.asList(
            "QLED 55", "QLED 65", "Crystal UHD 50", "Frame 43"
        ));
        
        TYPE_MODELS.put("SONY_TV", Arrays.asList(
            "BRAVIA XR 55", "BRAVIA XR 65", "BRAVIA 50", "BRAVIA 43"
        ));
        TYPE_MODELS.put("SONY_CAMERA", Arrays.asList(
            "Alpha 7 IV", "Alpha 7 III", "Alpha 6400", "ZV-E10"
        ));
        
        TYPE_MODELS.put("MICROSOFT_LAPTOP", Arrays.asList(
            "Surface Laptop 5", "Surface Pro 9", "Surface Laptop Studio"
        ));
        
        TYPE_MODELS.put("ASUS_LAPTOP", Arrays.asList(
            "ROG Strix", "ZenBook 14", "VivoBook 15", "TUF Gaming"
        ));
        
        TYPE_MODELS.put("XIAOMI_MOBILE_PHONE", Arrays.asList(
            "Mi 13", "Redmi Note 12", "Redmi 11", "POCO X5"
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
            "Mükemmel durumda, kutusu ve tüm aksesuarları ile birlikte. Orijinal faturası mevcut.",
            "Yeni gibi, hiç kullanılmadı. Orijinal kutusu ve etiketleri ile.",
            "Çok iyi durumda, dikkatli kullanıldı. Tüm özellikleri çalışıyor.",
            "İyi durumda, normal kullanım izleri var. Bakımlı ve temiz.",
            "Mükemmel kalitede, orijinal ürün. Sadece deneme amaçlı açıldı.",
            "Çok iyi durumda, minimal kullanım izi var. Orijinal ambalajı ile.",
            "Yeni gibi, etiketli. Orijinal faturası ve garantisi mevcut.",
            "İyi durumda, düzenli bakım yapıldı. Tüm fonksiyonlar çalışıyor.",
            "Mükemmel durumda, nadiren kullanıldı. Orijinal kutusu korunmuş.",
            "Çok iyi durumda, dikkatli kullanıldı. Orijinal aksesuarları ile birlikte."
        ));
    }
    
    /**
     * Rastgele bir electronics listing oluşturur
     */
    public ElectronicCreateRequest generateRandomListing() {
        ElectronicBrand brand = getRandomBrand();
        ElectronicType type = getRandomTypeForBrand(brand);
        Color color = getRandomColorForType(type);
        
        PriceRange priceRange = BRAND_PRICE_RANGES.get(brand);
        BigDecimal basePrice = generatePrice(priceRange, type);
        
        String title = generateTitle(brand, type);
        String description = generateDescription(brand, type, color);
        String model = generateModel(brand, type);
        String origin = getRandomOrigin();
        boolean warrantyProof = random.nextBoolean();
        int year = generateYear();
        
        String[] cityDistrict = getRandomCityDistrict();
        
        // Laptop için özel alanlar
        Integer ram = null;
        Integer storage = null;
        Processor processor = null;
        Integer screenSize = null;
        
        if (type == ElectronicType.LAPTOP) {
            ram = generateRam();
            storage = generateStorage();
            processor = getRandomProcessor();
            screenSize = generateScreenSize();
        }
        
        return new ElectronicCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            type,
            brand,
            model,
            origin,
            warrantyProof,
            year,
            color,
            null, // imageUrl
            ram,
            storage,
            processor,
            screenSize
        );
    }
    
    /**
     * Belirli bir brand için listing oluşturur
     */
    public ElectronicCreateRequest generateForBrand(ElectronicBrand brand) {
        ElectronicType type = getRandomTypeForBrand(brand);
        Color color = getRandomColorForType(type);
        
        PriceRange priceRange = BRAND_PRICE_RANGES.get(brand);
        BigDecimal basePrice = generatePrice(priceRange, type);
        
        String title = generateTitle(brand, type);
        String description = generateDescription(brand, type, color);
        String model = generateModel(brand, type);
        String origin = getRandomOrigin();
        boolean warrantyProof = random.nextBoolean();
        int year = generateYear();
        
        String[] cityDistrict = getRandomCityDistrict();
        
        // Laptop için özel alanlar
        Integer ram = null;
        Integer storage = null;
        Processor processor = null;
        Integer screenSize = null;
        
        if (type == ElectronicType.LAPTOP) {
            ram = generateRam();
            storage = generateStorage();
            processor = getRandomProcessor();
            screenSize = generateScreenSize();
        }
        
        return new ElectronicCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            type,
            brand,
            model,
            origin,
            warrantyProof,
            year,
            color,
            null,
            ram,
            storage,
            processor,
            screenSize
        );
    }
    
    /**
     * Belirli sayıda listing oluşturur
     */
    public List<ElectronicCreateRequest> generateListings(int count) {
        List<ElectronicCreateRequest> listings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            listings.add(generateRandomListing());
        }
        return listings;
    }
    
    // Helper methods
    
    private ElectronicBrand getRandomBrand() {
        ElectronicBrand[] brands = ElectronicBrand.values();
        return brands[random.nextInt(brands.length)];
    }
    
    private ElectronicType getRandomTypeForBrand(ElectronicBrand brand) {
        List<ElectronicType> types = BRAND_TYPES.getOrDefault(brand, 
            Arrays.asList(ElectronicType.MOBILE_PHONE, ElectronicType.LAPTOP, ElectronicType.TV));
        return types.get(random.nextInt(types.size()));
    }
    
    private Color getRandomColorForType(ElectronicType type) {
        List<Color> colors = TYPE_COLORS.getOrDefault(type, 
            Arrays.asList(Color.BLACK, Color.WHITE, Color.SILVER, Color.GRAY));
        return colors.get(random.nextInt(colors.size()));
    }
    
    private BigDecimal generatePrice(PriceRange range, ElectronicType type) {
        // Type'a göre fiyat çarpanı
        double typeMultiplier = getTypeMultiplier(type);
        
        // Base price
        double basePrice = range.min + (range.max - range.min) * random.nextDouble();
        basePrice *= typeMultiplier;
        
        // Yuvarla
        BigDecimal price = BigDecimal.valueOf(basePrice);
        price = price.setScale(2, RoundingMode.HALF_UP);
        
        // Minimum 100 TL
        if (price.compareTo(BigDecimal.valueOf(100)) < 0) {
            price = BigDecimal.valueOf(100);
        }
        
        return price;
    }
    
    private double getTypeMultiplier(ElectronicType type) {
        // Laptop ve TV daha pahalı
        if (type == ElectronicType.LAPTOP) {
            return 1.3;
        }
        if (type == ElectronicType.TV) {
            return 1.5;
        }
        if (type == ElectronicType.MOBILE_PHONE) {
            return 1.0;
        }
        if (type == ElectronicType.CAMERA) {
            return 1.2;
        }
        if (type == ElectronicType.HEADPHONES || type == ElectronicType.SPEAKER) {
            return 0.3;
        }
        return 1.0;
    }
    
    private String generateTitle(ElectronicBrand brand, ElectronicType type) {
        String brandName = brand.getLabel();
        String typeName = type.getLabel();
        String model = generateModel(brand, type);
        
        return String.format("%s %s %s", brandName, model, typeName);
    }
    
    private String generateModel(ElectronicBrand brand, ElectronicType type) {
        String key = brand.name() + "_" + type.name();
        List<String> models = TYPE_MODELS.get(key);
        
        if (models != null && !models.isEmpty()) {
            return models.get(random.nextInt(models.size()));
        }
        
        // Default model isimleri
        switch (type) {
            case MOBILE_PHONE:
                return "Model " + (2020 + random.nextInt(4));
            case LAPTOP:
                return "Series " + (char)('A' + random.nextInt(5));
            case TV:
                return (40 + random.nextInt(30)) + " inch";
            case TABLET:
                return "Pad " + (10 + random.nextInt(3));
            default:
                return "Standard";
        }
    }
    
    private String generateDescription(ElectronicBrand brand, ElectronicType type, Color color) {
        String template = DESCRIPTION_TEMPLATES.get(random.nextInt(DESCRIPTION_TEMPLATES.size()));
        String brandName = brand.getLabel();
        String typeName = type.getLabel();
        String colorName = color.getLabel();
        String model = generateModel(brand, type);
        
        return String.format("%s %s %s renkli %s. %s %s", 
            brandName, model, colorName, typeName, template,
            getAdditionalDetails(type));
    }
    
    private String getAdditionalDetails(ElectronicType type) {
        List<String> details = new ArrayList<>();
        
        if (type == ElectronicType.LAPTOP) {
            details.add(String.format("RAM: %d GB, Storage: %d GB", generateRam(), generateStorage()));
        }
        
        if (type == ElectronicType.MOBILE_PHONE || type == ElectronicType.TABLET) {
            int storage = 64 + random.nextInt(5) * 64; // 64, 128, 256, 512 GB
            details.add(String.format("Storage: %d GB", storage));
        }
        
        if (type == ElectronicType.TV) {
            int size = 40 + random.nextInt(30); // 40-70 inch
            details.add(String.format("Screen Size: %d inch", size));
        }
        
        if (random.nextBoolean()) {
            details.add("Orijinal faturası mevcut.");
        }
        
        return String.join(" ", details);
    }
    
    private String getRandomOrigin() {
        String[] origins = {"Türkiye", "Çin", "Güney Kore", "Japonya", "ABD", "Almanya"};
        return origins[random.nextInt(origins.length)];
    }
    
    private int generateYear() {
        // Son 5 yıl içinde
        int currentYear = java.time.Year.now().getValue();
        return currentYear - random.nextInt(5);
    }
    
    private Integer generateRam() {
        int[] ramOptions = {4, 8, 16, 32, 64};
        return ramOptions[random.nextInt(ramOptions.length)];
    }
    
    private Integer generateStorage() {
        int[] storageOptions = {128, 256, 512, 1024, 2048};
        return storageOptions[random.nextInt(storageOptions.length)];
    }
    
    private Processor getRandomProcessor() {
        Processor[] processors = Processor.values();
        return processors[random.nextInt(processors.length)];
    }
    
    private Integer generateScreenSize() {
        // 13-17 inch arası
        return 13 + random.nextInt(5);
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

