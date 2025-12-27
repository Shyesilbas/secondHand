package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.*;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * Gerçekçi ve mantıklı clothing listing'ler oluşturan generator sınıfı.
 * Brand'e göre fiyat aralıkları, mantıklı kombinasyonlar ve gerçekçi açıklamalar üretir.
 */
@Component
@Slf4j
public class ClothingListingGenerator {

    private static final Random random = new Random();
    
    // Brand'e göre fiyat aralıkları (TRY cinsinden)
    private static final Map<ClothingBrand, PriceRange> BRAND_PRICE_RANGES = new HashMap<>();
    
    // Brand'e göre uygun clothing type'lar
    private static final Map<ClothingBrand, List<ClothingType>> BRAND_TYPES = new HashMap<>();
    
    // Clothing type'a göre uygun renkler
    private static final Map<ClothingType, List<Color>> TYPE_COLORS = new HashMap<>();
    
    // Türk şehirleri ve ilçeleri
    private static final Map<String, List<String>> CITIES_DISTRICTS = new HashMap<>();
    
    // Açıklama şablonları
    private static final List<String> DESCRIPTION_TEMPLATES = new ArrayList<>();
    
    static {
        initializeBrandPriceRanges();
        initializeBrandTypes();
        initializeTypeColors();
        initializeCitiesDistricts();
        initializeDescriptionTemplates();
    }
    
    private static void initializeBrandPriceRanges() {
        // Lüks markalar
        BRAND_PRICE_RANGES.put(ClothingBrand.GUCCI, new PriceRange(5000, 50000));
        BRAND_PRICE_RANGES.put(ClothingBrand.PRADA, new PriceRange(4000, 45000));
        BRAND_PRICE_RANGES.put(ClothingBrand.LOUIS_VUITTON, new PriceRange(6000, 60000));
        BRAND_PRICE_RANGES.put(ClothingBrand.CHANEL, new PriceRange(5000, 55000));
        BRAND_PRICE_RANGES.put(ClothingBrand.HERMES, new PriceRange(8000, 80000));
        BRAND_PRICE_RANGES.put(ClothingBrand.ARMANI, new PriceRange(3000, 30000));
        
        // Orta-üst segment
        BRAND_PRICE_RANGES.put(ClothingBrand.TOMMY_HILFIGER, new PriceRange(800, 5000));
        BRAND_PRICE_RANGES.put(ClothingBrand.CALVIN_KLEIN, new PriceRange(600, 4000));
        BRAND_PRICE_RANGES.put(ClothingBrand.LACOSTE, new PriceRange(500, 3500));
        BRAND_PRICE_RANGES.put(ClothingBrand.RALPH_LAUREN, new PriceRange(1000, 6000));
        BRAND_PRICE_RANGES.put(ClothingBrand.DIESEL, new PriceRange(700, 4500));
        
        // Orta segment
        BRAND_PRICE_RANGES.put(ClothingBrand.ZARA, new PriceRange(200, 2000));
        BRAND_PRICE_RANGES.put(ClothingBrand.H_M, new PriceRange(150, 1500));
        BRAND_PRICE_RANGES.put(ClothingBrand.UNIQLO, new PriceRange(100, 1200));
        BRAND_PRICE_RANGES.put(ClothingBrand.GAP, new PriceRange(150, 1800));
        BRAND_PRICE_RANGES.put(ClothingBrand.LEVI_S, new PriceRange(300, 2500));
        
        // Spor markaları
        BRAND_PRICE_RANGES.put(ClothingBrand.NIKE, new PriceRange(300, 5000));
        BRAND_PRICE_RANGES.put(ClothingBrand.ADIDAS, new PriceRange(300, 4500));
        BRAND_PRICE_RANGES.put(ClothingBrand.PUMA, new PriceRange(250, 3500));
        BRAND_PRICE_RANGES.put(ClothingBrand.UNDER_ARMOUR, new PriceRange(400, 4000));
        
        // Diğer
        BRAND_PRICE_RANGES.put(ClothingBrand.OTHER, new PriceRange(50, 1000));
    }
    
    private static void initializeBrandTypes() {
        // Spor markaları - spor giyim
        BRAND_TYPES.put(ClothingBrand.NIKE, Arrays.asList(
            ClothingType.SNEAKERS, ClothingType.SHOES, ClothingType.TSHIRT, 
            ClothingType.SHORTS, ClothingType.HOODIE, ClothingType.SWEATSHIRT,
            ClothingType.PANTS, ClothingType.JACKET, ClothingType.CAP
        ));
        BRAND_TYPES.put(ClothingBrand.ADIDAS, Arrays.asList(
            ClothingType.SNEAKERS, ClothingType.SHOES, ClothingType.TSHIRT,
            ClothingType.SHORTS, ClothingType.HOODIE, ClothingType.SWEATSHIRT,
            ClothingType.PANTS, ClothingType.JACKET, ClothingType.CAP
        ));
        BRAND_TYPES.put(ClothingBrand.PUMA, Arrays.asList(
            ClothingType.SNEAKERS, ClothingType.SHOES, ClothingType.TSHIRT,
            ClothingType.SHORTS, ClothingType.HOODIE, ClothingType.PANTS
        ));
        
        // Lüks markalar - klasik ve şık
        BRAND_TYPES.put(ClothingBrand.GUCCI, Arrays.asList(
            ClothingType.SHOES, ClothingType.BAG, ClothingType.SUIT,
            ClothingType.SHIRT, ClothingType.JACKET, ClothingType.DRESS,
            ClothingType.HEELS, ClothingType.BELT
        ));
        BRAND_TYPES.put(ClothingBrand.PRADA, Arrays.asList(
            ClothingType.BAG, ClothingType.SHOES, ClothingType.SHIRT,
            ClothingType.DRESS, ClothingType.JACKET, ClothingType.HEELS
        ));
        BRAND_TYPES.put(ClothingBrand.LOUIS_VUITTON, Arrays.asList(
            ClothingType.BAG, ClothingType.SHOES, ClothingType.SHIRT,
            ClothingType.DRESS, ClothingType.JACKET
        ));
        
        // Günlük giyim markaları
        BRAND_TYPES.put(ClothingBrand.ZARA, Arrays.asList(
            ClothingType.SHIRT, ClothingType.PANTS, ClothingType.JEANS,
            ClothingType.DRESS, ClothingType.JACKET, ClothingType.COAT,
            ClothingType.SHOES, ClothingType.SNEAKERS, ClothingType.SKIRT
        ));
        BRAND_TYPES.put(ClothingBrand.H_M, Arrays.asList(
            ClothingType.SHIRT, ClothingType.TSHIRT, ClothingType.PANTS,
            ClothingType.JEANS, ClothingType.DRESS, ClothingType.JACKET,
            ClothingType.SHOES, ClothingType.SNEAKERS
        ));
        BRAND_TYPES.put(ClothingBrand.UNIQLO, Arrays.asList(
            ClothingType.SHIRT, ClothingType.TSHIRT, ClothingType.PANTS,
            ClothingType.JEANS, ClothingType.SWEATER, ClothingType.JACKET
        ));
        
        // Klasik markalar
        BRAND_TYPES.put(ClothingBrand.LEVI_S, Arrays.asList(
            ClothingType.JEANS, ClothingType.JACKET, ClothingType.SHIRT,
            ClothingType.SHORTS
        ));
        BRAND_TYPES.put(ClothingBrand.TOMMY_HILFIGER, Arrays.asList(
            ClothingType.SHIRT, ClothingType.PANTS, ClothingType.JEANS,
            ClothingType.JACKET, ClothingType.SWEATER, ClothingType.SHOES
        ));
        
        // Diğer markalar için genel tipler
        BRAND_TYPES.put(ClothingBrand.OTHER, Arrays.asList(
            ClothingType.TSHIRT, ClothingType.SHIRT, ClothingType.PANTS,
            ClothingType.JEANS, ClothingType.SHOES, ClothingType.SNEAKERS
        ));
    }
    
    private static void initializeTypeColors() {
        // Günlük giyim için geniş renk seçenekleri
        TYPE_COLORS.put(ClothingType.TSHIRT, Arrays.asList(
            Color.WHITE, Color.BLACK, Color.GRAY, Color.BLUE, Color.RED,
            Color.GREEN, Color.YELLOW, Color.ORANGE
        ));
        TYPE_COLORS.put(ClothingType.SHIRT, Arrays.asList(
            Color.WHITE, Color.BLUE, Color.BLACK, Color.GRAY, Color.BEIGE
        ));
        TYPE_COLORS.put(ClothingType.JEANS, Arrays.asList(
            Color.BLUE, Color.BLACK, Color.GRAY, Color.BEIGE
        ));
        TYPE_COLORS.put(ClothingType.PANTS, Arrays.asList(
            Color.BLACK, Color.GRAY, Color.BEIGE, Color.BROWN, Color.BLUE
        ));
        TYPE_COLORS.put(ClothingType.DRESS, Arrays.asList(
            Color.BLACK, Color.RED, Color.BLUE, Color.GREEN, Color.PURPLE_AMETHYST,
            Color.WHITE, Color.YELLOW
        ));
        TYPE_COLORS.put(ClothingType.SNEAKERS, Arrays.asList(
            Color.WHITE, Color.BLACK, Color.GRAY, Color.RED, Color.BLUE,
            Color.GREEN, Color.YELLOW
        ));
        TYPE_COLORS.put(ClothingType.SHOES, Arrays.asList(
            Color.BLACK, Color.BROWN, Color.BEIGE, Color.WHITE
        ));
        TYPE_COLORS.put(ClothingType.JACKET, Arrays.asList(
            Color.BLACK, Color.BLUE, Color.GRAY, Color.BROWN, Color.GREEN
        ));
        TYPE_COLORS.put(ClothingType.COAT, Arrays.asList(
            Color.BLACK, Color.BLUE, Color.GRAY, Color.BEIGE, Color.BROWN
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
            "Mükemmel durumda, sadece birkaç kez giyildi. Orijinal etiketi mevcut.",
            "Yeni gibi, hiç giyilmedi. Orijinal kutusu/poşeti ile birlikte.",
            "İyi durumda, düzenli kullanıldı. Bakımlı ve temiz.",
            "Çok iyi durumda, minimal kullanım izi var. Orijinal ambalajı ile.",
            "Mükemmel kalitede, orijinal ürün. Sadece deneme amaçlı giyildi.",
            "İyi durumda, normal kullanım izleri var. Bakımlı ve temiz.",
            "Yeni gibi, etiketli. Orijinal faturası mevcut.",
            "Çok iyi durumda, dikkatli kullanıldı. Orijinal kutusu ile.",
            "Mükemmel durumda, nadiren giyildi. Orijinal etiketi korunmuş.",
            "İyi durumda, düzenli bakım yapıldı. Temiz ve kullanıma hazır."
        ));
    }
    
    /**
     * Rastgele bir clothing listing oluşturur
     */
    public ClothingCreateRequest generateRandomListing() {
        ClothingBrand brand = getRandomBrand();
        ClothingType type = getRandomTypeForBrand(brand);
        Color color = getRandomColorForType(type);
        ClothingCondition condition = getRandomCondition();
        ClothingGender gender = getRandomGender();
        ClothingCategory category = getCategoryForGender(gender);
        
        PriceRange priceRange = BRAND_PRICE_RANGES.get(brand);
        BigDecimal basePrice = generatePrice(priceRange, type, condition);
        
        String title = generateTitle(brand, type, color);
        String description = generateDescription(brand, type, color, condition);
        LocalDate purchaseDate = generatePurchaseDate(condition);
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new ClothingCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            brand,
            type,
            color,
            purchaseDate,
            condition,
            gender,
            category,
            null // imageUrl
        );
    }
    
    /**
     * Belirli bir brand için listing oluşturur
     */
    public ClothingCreateRequest generateForBrand(ClothingBrand brand) {
        ClothingType type = getRandomTypeForBrand(brand);
        Color color = getRandomColorForType(type);
        ClothingCondition condition = getRandomCondition();
        ClothingGender gender = getRandomGender();
        ClothingCategory category = getCategoryForGender(gender);
        
        PriceRange priceRange = BRAND_PRICE_RANGES.get(brand);
        BigDecimal basePrice = generatePrice(priceRange, type, condition);
        
        String title = generateTitle(brand, type, color);
        String description = generateDescription(brand, type, color, condition);
        LocalDate purchaseDate = generatePurchaseDate(condition);
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new ClothingCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            brand,
            type,
            color,
            purchaseDate,
            condition,
            gender,
            category,
            null
        );
    }
    
    /**
     * Belirli sayıda listing oluşturur ve veritabanına kaydeder
     * Not: Bu metod ClothingListingService'e bağımlıdır, 
     * kullanmak için service'i inject etmeniz gerekir
     */
    public List<ClothingCreateRequest> generateListings(int count) {
        List<ClothingCreateRequest> listings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            listings.add(generateRandomListing());
        }
        return listings;
    }
    
    // Helper methods
    
    private ClothingBrand getRandomBrand() {
        ClothingBrand[] brands = ClothingBrand.values();
        return brands[random.nextInt(brands.length)];
    }
    
    private ClothingType getRandomTypeForBrand(ClothingBrand brand) {
        List<ClothingType> types = BRAND_TYPES.getOrDefault(brand, 
            Arrays.asList(ClothingType.TSHIRT, ClothingType.SHIRT, ClothingType.PANTS));
        return types.get(random.nextInt(types.size()));
    }
    
    private Color getRandomColorForType(ClothingType type) {
        List<Color> colors = TYPE_COLORS.getOrDefault(type, 
            Arrays.asList(Color.BLACK, Color.WHITE, Color.BLUE, Color.GRAY));
        return colors.get(random.nextInt(colors.size()));
    }
    
    private ClothingCondition getRandomCondition() {
        // Daha fazla iyi durumda ürün üret
        int rand = random.nextInt(100);
        if (rand < 40) return ClothingCondition.EXCELLENT;
        if (rand < 70) return ClothingCondition.GOOD;
        if (rand < 85) return ClothingCondition.FAIR;
        if (rand < 95) return ClothingCondition.WORN;
        return ClothingCondition.DAMAGED;
    }
    
    private ClothingGender getRandomGender() {
        return random.nextBoolean() ? ClothingGender.MALE : ClothingGender.FEMALE;
    }
    
    private ClothingCategory getCategoryForGender(ClothingGender gender) {
        if (gender == ClothingGender.MALE) {
            ClothingCategory[] categories = {
                ClothingCategory.MALE_ADULT, ClothingCategory.BOY_YOUTH, 
                ClothingCategory.BOY_CHILD, ClothingCategory.UNISEX
            };
            return categories[random.nextInt(categories.length)];
        } else {
            ClothingCategory[] categories = {
                ClothingCategory.FEMALE_ADULT, ClothingCategory.GIRL_YOUTH,
                ClothingCategory.GIRL_CHILD, ClothingCategory.UNISEX
            };
            return categories[random.nextInt(categories.length)];
        }
    }
    
    private BigDecimal generatePrice(PriceRange range, ClothingType type, ClothingCondition condition) {
        // Type'a göre fiyat çarpanı
        double typeMultiplier = getTypeMultiplier(type);
        
        // Base price
        double basePrice = range.min + (range.max - range.min) * random.nextDouble();
        basePrice *= typeMultiplier;
        
        // Condition'a göre indirim
        double conditionDiscount = getConditionDiscount(condition);
        basePrice *= conditionDiscount;
        
        // Yuvarla
        BigDecimal price = BigDecimal.valueOf(basePrice);
        price = price.setScale(2, RoundingMode.HALF_UP);
        
        // Minimum 50 TL
        if (price.compareTo(BigDecimal.valueOf(50)) < 0) {
            price = BigDecimal.valueOf(50);
        }
        
        return price;
    }
    
    private double getTypeMultiplier(ClothingType type) {
        // Ayakkabı ve çanta daha pahalı
        if (type == ClothingType.SHOES || type == ClothingType.SNEAKERS || 
            type == ClothingType.HEELS || type == ClothingType.BOOTS) {
            return 1.2;
        }
        if (type == ClothingType.BAG) {
            return 1.5;
        }
        if (type == ClothingType.SUIT || type == ClothingType.COAT) {
            return 1.3;
        }
        if (type == ClothingType.SOCKS || type == ClothingType.UNDERWEAR) {
            return 0.3;
        }
        return 1.0;
    }
    
    private double getConditionDiscount(ClothingCondition condition) {
        switch (condition) {
            case EXCELLENT: return 0.85; // %15 indirim
            case GOOD: return 0.70; // %30 indirim
            case FAIR: return 0.55; // %45 indirim
            case WORN: return 0.40; // %60 indirim
            case DAMAGED: return 0.25; // %75 indirim
            default: return 1.0;
        }
    }
    
    private String generateTitle(ClothingBrand brand, ClothingType type, Color color) {
        String brandName = brand.getLabel();
        String typeName = type.getLabel();
        String colorName = color.getLabel();
        
        // Bazen renk ekle, bazen ekleme
        if (random.nextBoolean()) {
            return String.format("%s %s %s", brandName, colorName, typeName);
        } else {
            return String.format("%s %s", brandName, typeName);
        }
    }
    
    private String generateDescription(ClothingBrand brand, ClothingType type, Color color, ClothingCondition condition) {
        String template = DESCRIPTION_TEMPLATES.get(random.nextInt(DESCRIPTION_TEMPLATES.size()));
        String brandName = brand.getLabel();
        String typeName = type.getLabel();
        String colorName = color.getLabel();
        String conditionText = getConditionText(condition);
        
        return String.format("%s %s %s renkli %s. %s %s", 
            brandName, colorName, typeName, conditionText, template,
            getAdditionalDetails(type, condition));
    }
    
    private String getConditionText(ClothingCondition condition) {
        switch (condition) {
            case EXCELLENT: return "mükemmel durumda";
            case GOOD: return "çok iyi durumda";
            case FAIR: return "iyi durumda";
            case WORN: return "kullanılmış";
            case DAMAGED: return "hasarlı";
            default: return "";
        }
    }
    
    private String getAdditionalDetails(ClothingType type, ClothingCondition condition) {
        List<String> details = new ArrayList<>();
        
        if (type == ClothingType.SHOES || type == ClothingType.SNEAKERS) {
            int size = 36 + random.nextInt(10); // 36-45
            details.add(String.format("Beden: %d", size));
        }
        
        if (type == ClothingType.SHIRT || type == ClothingType.TSHIRT || 
            type == ClothingType.SWEATER || type == ClothingType.HOODIE) {
            String[] sizes = {"S", "M", "L", "XL"};
            details.add(String.format("Beden: %s", sizes[random.nextInt(sizes.length)]));
        }
        
        if (condition == ClothingCondition.EXCELLENT || condition == ClothingCondition.GOOD) {
            if (random.nextBoolean()) {
                details.add("Orijinal faturası mevcut.");
            }
        }
        
        return String.join(" ", details);
    }
    
    private LocalDate generatePurchaseDate(ClothingCondition condition) {
        LocalDate now = LocalDate.now();
        int monthsAgo;
        
        // Condition'a göre satın alma tarihi
        switch (condition) {
            case EXCELLENT:
                monthsAgo = 1 + random.nextInt(6); // 1-6 ay önce
                break;
            case GOOD:
                monthsAgo = 6 + random.nextInt(12); // 6-18 ay önce
                break;
            case FAIR:
                monthsAgo = 18 + random.nextInt(24); // 18-42 ay önce
                break;
            case WORN:
                monthsAgo = 24 + random.nextInt(36); // 24-60 ay önce
                break;
            case DAMAGED:
                monthsAgo = 36 + random.nextInt(48); // 36-84 ay önce
                break;
            default:
                monthsAgo = 12;
        }
        
        return now.minusMonths(monthsAgo);
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

