package com.serhat.secondhand.listing.util;

import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Gerçekçi ve mantıklı sports listing'ler oluşturan generator sınıfı.
 * Discipline'e göre fiyat aralıkları, mantıklı kombinasyonlar ve gerçekçi açıklamalar üretir.
 */
@Component
@Slf4j
public class SportsListingGenerator {

    private static final Random random = new Random();
    
    // Discipline'e göre fiyat aralıkları (TRY cinsinden)
    private static final Map<SportDiscipline, PriceRange> DISCIPLINE_PRICE_RANGES = new HashMap<>();
    
    // Discipline'e göre uygun equipment type'lar
    private static final Map<SportDiscipline, List<SportEquipmentType>> DISCIPLINE_EQUIPMENT = new HashMap<>();
    
    // Equipment type'a göre fiyat çarpanları
    private static final Map<SportEquipmentType, Double> EQUIPMENT_MULTIPLIERS = new HashMap<>();
    
    // Türk şehirleri ve ilçeleri
    private static final Map<String, List<String>> CITIES_DISTRICTS = new HashMap<>();
    
    // Açıklama şablonları
    private static final List<String> DESCRIPTION_TEMPLATES = new ArrayList<>();
    
    static {
        initializeDisciplinePriceRanges();
        initializeDisciplineEquipment();
        initializeEquipmentMultipliers();
        initializeCitiesDistricts();
        initializeDescriptionTemplates();
    }
    
    private static void initializeDisciplinePriceRanges() {
        // Fitness ekipmanları daha pahalı
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.RUNNING, new PriceRange(200, 5000));
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.CYCLING, new PriceRange(500, 10000));
        
        // Takım sporları
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.FOOTBALL, new PriceRange(100, 3000));
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.BASKETBALL, new PriceRange(150, 2500));
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.TENNIS, new PriceRange(200, 4000));
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.VOLLEYBALL, new PriceRange(100, 2000));
        
        // Diğer
        DISCIPLINE_PRICE_RANGES.put(SportDiscipline.OTHER, new PriceRange(50, 2000));
    }
    
    private static void initializeDisciplineEquipment() {
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.FOOTBALL, Arrays.asList(
            SportEquipmentType.CLEATS, SportEquipmentType.JERSEY, SportEquipmentType.SHORTS,
            SportEquipmentType.BALL, SportEquipmentType.WRISTBAND
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.BASKETBALL, Arrays.asList(
            SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.BALL,
            SportEquipmentType.WRISTBAND
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.TENNIS, Arrays.asList(
            SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.BALL
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.VOLLEYBALL, Arrays.asList(
            SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.BALL
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.RUNNING, Arrays.asList(
            SportEquipmentType.SHORTS, SportEquipmentType.SLEEVE, SportEquipmentType.TREADMILL
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.CYCLING, Arrays.asList(
            SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.EXERCISE_BIKE
        ));
        DISCIPLINE_EQUIPMENT.put(SportDiscipline.OTHER, Arrays.asList(
            SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.BALL,
            SportEquipmentType.OTHER
        ));
    }
    
    private static void initializeEquipmentMultipliers() {
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.TREADMILL, 5.0);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.EXERCISE_BIKE, 4.0);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.CLEATS, 1.5);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.BALL, 1.2);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.JERSEY, 1.0);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.SHORTS, 0.8);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.SLEEVE, 0.5);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.WRISTBAND, 0.3);
        EQUIPMENT_MULTIPLIERS.put(SportEquipmentType.OTHER, 1.0);
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
            "Mükemmel durumda, sadece birkaç kez kullanıldı. Orijinal kutusu ile birlikte.",
            "Yeni gibi, hiç kullanılmadı. Orijinal etiketleri mevcut.",
            "Çok iyi durumda, dikkatli kullanıldı. Tüm özellikleri çalışıyor.",
            "İyi durumda, normal kullanım izleri var. Bakımlı ve temiz.",
            "Mükemmel kalitede, orijinal ürün. Sadece deneme amaçlı kullanıldı.",
            "Çok iyi durumda, minimal kullanım izi var. Orijinal ambalajı ile.",
            "Yeni gibi, etiketli. Orijinal faturası mevcut.",
            "İyi durumda, düzenli bakım yapıldı. Kullanıma hazır.",
            "Mükemmel durumda, nadiren kullanıldı. Orijinal kutusu korunmuş.",
            "Çok iyi durumda, dikkatli kullanıldı. Tüm aksesuarları ile birlikte."
        ));
    }
    
    /**
     * Rastgele bir sports listing oluşturur
     */
    public SportsCreateRequest generateRandomListing() {
        SportDiscipline discipline = getRandomDiscipline();
        SportEquipmentType equipmentType = getRandomEquipmentForDiscipline(discipline);
        SportCondition condition = getRandomCondition();
        
        PriceRange priceRange = DISCIPLINE_PRICE_RANGES.get(discipline);
        BigDecimal basePrice = generatePrice(priceRange, equipmentType, condition);
        
        String title = generateTitle(discipline, equipmentType);
        String description = generateDescription(discipline, equipmentType, condition);
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new SportsCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            discipline,
            equipmentType,
            condition,
            null // imageUrl
        );
    }
    
    /**
     * Belirli bir discipline için listing oluşturur
     */
    public SportsCreateRequest generateForDiscipline(SportDiscipline discipline) {
        SportEquipmentType equipmentType = getRandomEquipmentForDiscipline(discipline);
        SportCondition condition = getRandomCondition();
        
        PriceRange priceRange = DISCIPLINE_PRICE_RANGES.get(discipline);
        BigDecimal basePrice = generatePrice(priceRange, equipmentType, condition);
        
        String title = generateTitle(discipline, equipmentType);
        String description = generateDescription(discipline, equipmentType, condition);
        
        String[] cityDistrict = getRandomCityDistrict();
        
        return new SportsCreateRequest(
            title,
            description,
            basePrice,
            Currency.TRY,
            1,
            cityDistrict[0],
            cityDistrict[1],
            discipline,
            equipmentType,
            condition,
            null
        );
    }
    
    /**
     * Belirli sayıda listing oluşturur
     */
    public List<SportsCreateRequest> generateListings(int count) {
        List<SportsCreateRequest> listings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            listings.add(generateRandomListing());
        }
        return listings;
    }
    
    // Helper methods
    
    private SportDiscipline getRandomDiscipline() {
        SportDiscipline[] disciplines = SportDiscipline.values();
        return disciplines[random.nextInt(disciplines.length)];
    }
    
    private SportEquipmentType getRandomEquipmentForDiscipline(SportDiscipline discipline) {
        List<SportEquipmentType> equipment = DISCIPLINE_EQUIPMENT.getOrDefault(discipline, 
            Arrays.asList(SportEquipmentType.JERSEY, SportEquipmentType.SHORTS, SportEquipmentType.BALL));
        return equipment.get(random.nextInt(equipment.size()));
    }
    
    private SportCondition getRandomCondition() {
        int rand = random.nextInt(100);
        if (rand < 25) return SportCondition.NEW;
        if (rand < 55) return SportCondition.LIKE_NEW;
        if (rand < 80) return SportCondition.GOOD;
        if (rand < 95) return SportCondition.FAIR;
        return SportCondition.WORN;
    }
    
    private BigDecimal generatePrice(PriceRange range, SportEquipmentType equipmentType, SportCondition condition) {
        // Equipment type'a göre fiyat çarpanı
        double equipmentMultiplier = EQUIPMENT_MULTIPLIERS.getOrDefault(equipmentType, 1.0);
        
        // Base price
        double basePrice = range.min + (range.max - range.min) * random.nextDouble();
        basePrice *= equipmentMultiplier;
        
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
    
    private double getConditionDiscount(SportCondition condition) {
        switch (condition) {
            case NEW: return 1.0; // %0 indirim
            case LIKE_NEW: return 0.80; // %20 indirim
            case GOOD: return 0.65; // %35 indirim
            case FAIR: return 0.45; // %55 indirim
            case WORN: return 0.30; // %70 indirim
            default: return 1.0;
        }
    }
    
    private String generateTitle(SportDiscipline discipline, SportEquipmentType equipmentType) {
        String disciplineName = discipline.getLabel();
        String equipmentName = equipmentType.getLabel();
        
        return String.format("%s %s", disciplineName, equipmentName);
    }
    
    private String generateDescription(SportDiscipline discipline, SportEquipmentType equipmentType, SportCondition condition) {
        String template = DESCRIPTION_TEMPLATES.get(random.nextInt(DESCRIPTION_TEMPLATES.size()));
        String disciplineName = discipline.getLabel();
        String equipmentName = equipmentType.getLabel();
        String conditionText = getConditionText(condition);
        
        return String.format("%s için %s ekipmanı. %s %s", 
            disciplineName, equipmentName, conditionText, template);
    }
    
    private String getConditionText(SportCondition condition) {
        switch (condition) {
            case NEW: return "Yeni,";
            case LIKE_NEW: return "Yeni gibi,";
            case GOOD: return "Çok iyi durumda,";
            case FAIR: return "İyi durumda,";
            case WORN: return "Kullanılmış,";
            default: return "";
        }
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

