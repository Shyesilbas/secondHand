package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.realestate.RealEstateListingService;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Builds realistic real estate listings for the local listing generator: a city / district from
 * {@code data/listing-generator/realestate-prices.json} (claude-draft TL/m² per city and district factors), a
 * property type with plausible rooms, area, floor, building age and amenities, and a price from the m² price with
 * age, floor and site adjustments. Listings go through {@link RealEstateListingService} so validation, rules and the
 * map point are the same as for a seller. No photos.
 */
@Component
@RequiredArgsConstructor
class RealEstateListingGenerator {

    private static final String PRICES = "data/listing-generator/realestate-prices.json";
    /** listings.price is NUMERIC(10,2); draws above this are redrawn. */
    private static final BigDecimal MAX_PRICE = BigDecimal.valueOf(95_000_000);

    record Prices(String source, String priceDate, String note, List<CityPrice> cities) {
    }

    record CityPrice(String city, int weight, long saleM2, long rentM2, double defaultDistrictFactor,
                     Map<String, Double> districtFactors) {
        double factor(String districtKey) {
            return districtFactors.getOrDefault(districtKey, defaultDistrictFactor);
        }
    }

    /** Catalog ids by key, read once per run. */
    record Catalog(Map<String, UUID> types, Map<String, UUID> adTypes, Map<String, UUID> heating, Map<String, UUID> owners) {
    }

    private record Kind(String type, boolean residential, boolean land, boolean rentable) {
    }

    private static final Map<Kind, Integer> KINDS = new LinkedHashMap<>();

    static {
        KINDS.put(new Kind("APARTMENT", true, false, true), 55);
        KINDS.put(new Kind("RESIDENCE", true, false, true), 6);
        KINDS.put(new Kind("STUDIO", true, false, true), 4);
        KINDS.put(new Kind("DUPLEX", true, false, true), 4);
        KINDS.put(new Kind("VILLA", true, false, true), 5);
        KINDS.put(new Kind("LAND", false, true, false), 7);
        KINDS.put(new Kind("COMMERCIAL_LAND", false, true, false), 2);
        KINDS.put(new Kind("FARM", false, true, false), 4);
        KINDS.put(new Kind("OFFICE", false, false, true), 4);
        KINDS.put(new Kind("COMMERCIAL", false, false, true), 5);
        KINDS.put(new Kind("WAREHOUSE", false, false, true), 2);
        KINDS.put(new Kind("BUILDING", false, false, false), 1);
    }

    private static final Map<String, Integer> GROSS_BY_ROOMS = Map.ofEntries(
            Map.entry("ROOM_1_0", 40), Map.entry("ROOM_1_1", 60), Map.entry("ROOM_2_0", 70), Map.entry("ROOM_2_1", 95),
            Map.entry("ROOM_2_2", 110), Map.entry("ROOM_3_1", 130), Map.entry("ROOM_3_2", 150), Map.entry("ROOM_4_1", 165),
            Map.entry("ROOM_4_2", 185), Map.entry("ROOM_5_1", 210), Map.entry("ROOM_5_2", 240), Map.entry("ROOM_6_1", 270));

    private static final Map<String, String> ROOM_LABEL = Map.ofEntries(
            Map.entry("ROOM_1_0", "1+0"), Map.entry("ROOM_1_1", "1+1"), Map.entry("ROOM_2_0", "2+0"), Map.entry("ROOM_2_1", "2+1"),
            Map.entry("ROOM_2_2", "2+2"), Map.entry("ROOM_3_1", "3+1"), Map.entry("ROOM_3_2", "3+2"), Map.entry("ROOM_4_1", "4+1"),
            Map.entry("ROOM_4_2", "4+2"), Map.entry("ROOM_5_1", "5+1"), Map.entry("ROOM_5_2", "5+2"), Map.entry("ROOM_6_1", "6+1"));

    private static final List<String> SITE_SUFFIXES = List.of("Park Evleri", "Konutları", "Yaşam Sitesi", "Bahçe Evleri",
            "Rezidans", "Vadi Konutları", "Panorama Sitesi", "Life");

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final RealEstateListingService realEstateListingService;

    Prices loadPrices() {
        Prices prices;
        try (InputStream is = new ClassPathResource(PRICES).getInputStream()) {
            prices = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).readValue(is, Prices.class);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read " + PRICES, e);
        }
        if (prices.cities() == null || prices.cities().isEmpty()) {
            throw new IllegalStateException(PRICES + " has no cities");
        }
        for (CityPrice c : prices.cities()) {
            if (c.saleM2() <= 0 || c.rentM2() <= 0 || c.weight() <= 0 || c.defaultDistrictFactor() <= 0) {
                throw new IllegalStateException(PRICES + ": invalid numbers for " + c.city());
            }
        }
        return prices;
    }

    Catalog catalog() {
        Catalog catalog = new Catalog(ids("real_estate_types"), ids("real_estate_ad_types"), ids("heating_types"),
                ids("listing_owner_types"));
        KINDS.keySet().forEach(k -> require(catalog.types(), k.type()));
        List.of("FOR_SALE", "FOR_RENT").forEach(k -> require(catalog.adTypes(), k));
        List.of("COMBI_BOILER", "CENTRAL_SYSTEM", "FLOOR_HEATING", "AIR_CONDITIONER", "STOVE").forEach(k -> require(catalog.heating(), k));
        List.of("OWNER", "AGENCY", "BUILDER").forEach(k -> require(catalog.owners(), k));
        return catalog;
    }

    private Map<String, UUID> ids(String table) {
        Map<String, UUID> ids = new HashMap<>();
        jdbcTemplate.query("SELECT id, name FROM " + table, rs -> {
            ids.put(rs.getString("name"), rs.getObject("id", UUID.class));
        });
        return ids;
    }

    private static void require(Map<String, UUID> ids, String key) {
        if (!ids.containsKey(key)) {
            throw new IllegalStateException("Real estate catalog has no " + key + "; run --app.seed=realestate first");
        }
    }

    Map<String, Integer> cityWeights(Prices prices) {
        Map<String, Integer> weights = new LinkedHashMap<>();
        prices.cities().forEach(c -> weights.put(c.city(), c.weight()));
        return weights;
    }

    UUID create(Prices prices, Catalog catalog, Long sellerId, GeneratorRandom random, GeneratorLocations.Place place) {
        CityPrice city = prices.cities().stream().filter(c -> c.city().equals(place.cityKey())).findFirst()
                .orElseThrow(() -> new IllegalStateException("No price for city " + place.cityKey()));
        Kind kind;
        boolean rent;
        Spec s;
        BigDecimal asking;
        int attempts = 0;
        do {
            if (++attempts > 20) {
                throw new IllegalStateException("No affordable real estate draw for " + place.districtKey());
            }
            kind = random.weighted(KINDS);
            rent = kind.rentable() && random.chance(kind.residential() ? 0.4 : 0.45);
            s = kind.land() ? land(kind, random) : kind.residential() ? home(kind, rent, random) : commercial(kind, random);
            double m2Price = (rent ? city.rentM2() : city.saleM2()) * city.factor(place.districtKey());
            double price = s.gross * m2Price * s.priceFactor * random.between(0.88, 1.12);
            if (rent && s.furnished) {
                price *= 1.15;
            }
            asking = GeneratorRandom.roundPrice(price);
        } while (asking.compareTo(MAX_PRICE) > 0);

        Map<String, Object> attributes = attributes(kind, rent, s, asking, random);
        String owner = s.buildingAge != null && s.buildingAge == 0 && !rent && random.chance(0.5) ? "BUILDER"
                : random.chance(0.55) ? "AGENCY" : "OWNER";

        String title = title(kind, rent, s, place);
        BaseListingCreateRequest base = new BaseListingCreateRequest(title, description(kind, rent, s, place),
                asking, Currency.TRY, place.cityLabel(), place.districtLabel(), place.cityKey(), place.districtKey(),
                place.neighborhoodKey(), null, false);
        RealEstateCreateRequest request = new RealEstateCreateRequest(base,
                catalog.adTypes().get(rent ? "FOR_RENT" : "FOR_SALE"), catalog.types().get(kind.type()),
                s.heating == null ? null : catalog.heating().get(s.heating), catalog.owners().get(owner),
                s.gross, s.net, s.roomConfig, s.bathrooms, s.floorKey, s.totalFloors, s.buildingAge, s.condition,
                s.furnished, s.balcony, s.elevator, s.parking, s.monthlyFee, s.inSite, s.siteName, s.garden, null,
                s.pool, s.zoning, null, null, null, s.kaks, s.gabari, s.roadFrontage, s.infrastructure,
                s.electricity, s.roadAccess, random.chance(0.08), attributes);
        Result<UUID> result = realEstateListingService.createRealEstateListing(request, sellerId);
        if (result.isError()) {
            throw new IllegalStateException("Generated real estate listing rejected (" + kind.type() + ", " + title + "): "
                    + result.getErrorCode() + " " + result.getMessage());
        }
        return result.getData();
    }

    /** The listing fields a generated property fills; null = not asked for its type. */
    private static final class Spec {
        int gross;
        Integer net;
        String roomConfig;
        Integer bathrooms;
        String floorKey;
        Integer totalFloors;
        Integer buildingAge;
        String condition;
        String heating;
        boolean furnished;
        boolean balcony;
        boolean elevator;
        boolean parking;
        boolean inSite;
        boolean pool;
        String siteName;
        BigDecimal monthlyFee;
        Integer garden;
        String zoning;
        BigDecimal kaks;
        BigDecimal gabari;
        BigDecimal roadFrontage;
        String infrastructure;
        boolean electricity;
        boolean roadAccess;
        double priceFactor = 1.0;
    }

    private Spec home(Kind kind, boolean rent, GeneratorRandom random) {
        Spec s = new Spec();
        s.roomConfig = random.weighted(switch (kind.type()) {
            case "STUDIO" -> w("ROOM_1_0", 70, "ROOM_1_1", 30);
            case "RESIDENCE" -> w("ROOM_1_1", 35, "ROOM_2_1", 35, "ROOM_3_1", 25, "ROOM_4_1", 5);
            case "DUPLEX" -> w("ROOM_3_2", 20, "ROOM_4_1", 35, "ROOM_4_2", 20, "ROOM_5_1", 15, "ROOM_5_2", 10);
            case "VILLA" -> w("ROOM_3_1", 15, "ROOM_4_1", 35, "ROOM_4_2", 15, "ROOM_5_1", 25, "ROOM_6_1", 10);
            default -> w("ROOM_1_0", 3, "ROOM_1_1", 12, "ROOM_2_0", 2, "ROOM_2_1", 30, "ROOM_3_1", 38,
                    "ROOM_3_2", 3, "ROOM_4_1", 10, "ROOM_4_2", 2);
        });
        boolean villa = "VILLA".equals(kind.type());
        s.gross = (int) Math.round(GROSS_BY_ROOMS.get(s.roomConfig) * random.between(0.85, 1.2) * (villa ? 1.4 : 1.0));
        s.net = (int) Math.round(s.gross * random.between(0.75, 0.85));
        int rooms = Integer.parseInt(s.roomConfig.substring(5, 6));
        s.bathrooms = rooms >= 3 && random.chance(0.6) ? 2 : 1;

        s.buildingAge = random.weighted(w(0, 12, 3, 20, 10, 30, 22, 28, 38, 10));
        if (s.buildingAge > 0) {
            s.buildingAge = Math.max(1, s.buildingAge + random.between(-2, 3));
        }
        if ("RESIDENCE".equals(kind.type())) {
            s.buildingAge = Math.min(s.buildingAge, 15);
        }
        boolean newish = s.buildingAge < 10;
        s.inSite = "RESIDENCE".equals(kind.type()) ? random.chance(0.9) : random.chance(newish ? 0.45 : 0.15);
        if (villa) {
            s.totalFloors = random.between(2, 3);
            s.garden = random.between(80, 600);
        } else {
            s.totalFloors = "RESIDENCE".equals(kind.type()) ? random.between(12, 35)
                    : newish ? random.between(4, 14) : random.between(3, 7);
            s.floorKey = floor(s.totalFloors, random);
        }
        s.elevator = !villa && (s.totalFloors >= 5 ? random.chance(0.92) : random.chance(0.15));
        s.parking = s.inSite || villa ? random.chance(0.8) : random.chance(newish ? 0.5 : 0.25);
        s.pool = (s.inSite && newish && random.chance(0.35)) || (villa && random.chance(0.4));
        s.balcony = !villa && random.chance(0.8);
        s.furnished = random.chance(rent ? 0.3 : 0.05);
        s.siteName = s.inSite ? random.pick(List.of("Yeşil", "Mavi", "Park", "Göl", "Çınar", "Lale", "Defne", "Zeytin",
                "Marin", "Akasya")) + " " + random.pick(SITE_SUFFIXES) : null;
        s.heating = s.buildingAge == 0 && random.chance(0.4) ? "FLOOR_HEATING"
                : random.weighted(w("COMBI_BOILER", 72, "CENTRAL_SYSTEM", 12, "AIR_CONDITIONER", 4,
                "STOVE", s.buildingAge > 20 ? 10 : 2));
        s.condition = s.buildingAge == 0 ? "BRAND_NEW" : s.buildingAge < 5 ? "GOOD_CONDITION"
                : random.weighted(w("GOOD_CONDITION", 55, "RENOVATED", 25, "NEEDS_RENOVATION", 20));
        double fee = s.inSite ? random.between(1500, 6000) : s.elevator ? random.between(500, 1500) : 0;
        s.monthlyFee = fee >= 100 ? BigDecimal.valueOf(Math.round(fee / 50) * 50L).setScale(2, RoundingMode.UNNECESSARY) : null;

        s.priceFactor = ageFactor(s.buildingAge) * floorFactor(s.floorKey) * (s.inSite ? 1.1 : 1.0) * (s.pool ? 1.05 : 1.0)
                * (villa ? 1.25 : "RESIDENCE".equals(kind.type()) ? 1.2 : 1.0);
        return s;
    }

    private Spec commercial(Kind kind, GeneratorRandom random) {
        Spec s = new Spec();
        switch (kind.type()) {
            case "OFFICE" -> { s.gross = random.between(60, 250); s.priceFactor = 1.1; }
            case "COMMERCIAL" -> { s.gross = random.between(40, 200); s.priceFactor = 1.4; }
            case "WAREHOUSE" -> { s.gross = random.between(300, 2000); s.priceFactor = 0.4; }
            default -> { s.gross = random.between(250, 1200); s.priceFactor = 0.9; }
        }
        s.net = (int) Math.round(s.gross * random.between(0.8, 0.92));
        s.buildingAge = random.between(0, 35);
        s.condition = s.buildingAge == 0 ? "BRAND_NEW" : random.weighted(w("GOOD_CONDITION", 60, "RENOVATED", 20, "NEEDS_RENOVATION", 20));
        s.heating = "WAREHOUSE".equals(kind.type()) ? null : random.weighted(w("COMBI_BOILER", 45, "CENTRAL_SYSTEM", 35, "AIR_CONDITIONER", 20));
        if ("BUILDING".equals(kind.type())) {
            s.totalFloors = random.between(3, 8);
        } else {
            s.totalFloors = random.between(1, "OFFICE".equals(kind.type()) ? 20 : 5);
            s.floorKey = "COMMERCIAL".equals(kind.type()) ? "GROUND" : floor(s.totalFloors, random);
            s.bathrooms = "WAREHOUSE".equals(kind.type()) ? 1 : random.between(1, 2);
        }
        s.elevator = s.totalFloors >= 4 && random.chance(0.85);
        s.parking = random.chance(0.4);
        s.priceFactor *= ageFactor(s.buildingAge);
        return s;
    }

    private Spec land(Kind kind, GeneratorRandom random) {
        Spec s = new Spec();
        switch (kind.type()) {
            case "LAND" -> {
                s.gross = random.between(250, 3000);
                s.zoning = random.weighted(w("RESIDENTIAL_ZONED", 70, "MIXED_ZONED", 15, "TOURISM_ZONED", 5, "UNZONED", 10));
                s.priceFactor = "UNZONED".equals(s.zoning) ? 0.08 : 0.25;
            }
            case "COMMERCIAL_LAND" -> {
                s.gross = random.between(500, 8000);
                s.zoning = random.weighted(w("COMMERCIAL_ZONED", 45, "INDUSTRIAL_ZONED", 35, "MIXED_ZONED", 20));
                s.priceFactor = 0.3;
            }
            default -> {
                s.gross = random.between(2000, 30000);
                s.zoning = random.weighted(w("AGRICULTURAL", 60, "VINEYARD_GARDEN", 25, "OLIVE_GROVE", 15));
                s.priceFactor = random.between(0.006, 0.02);
            }
        }
        boolean zoned = !List.of("UNZONED", "AGRICULTURAL", "VINEYARD_GARDEN", "OLIVE_GROVE").contains(s.zoning);
        if (zoned) {
            s.kaks = BigDecimal.valueOf(random.between(6, 40) * 0.05).setScale(2, RoundingMode.HALF_UP);
            s.gabari = BigDecimal.valueOf(random.pick(List.of(6.5, 9.5, 12.5, 15.5, 21.5))).setScale(2, RoundingMode.UNNECESSARY);
            s.infrastructure = random.weighted(w("COMPLETE", 60, "PARTIAL", 35, "NONE", 5));
        }
        if (!"FARM".equals(kind.type()) || random.chance(0.6)) {
            s.roadFrontage = BigDecimal.valueOf(random.between(8, 60)).setScale(2, RoundingMode.UNNECESSARY);
        }
        s.electricity = random.chance(zoned ? 0.85 : 0.5);
        s.roadAccess = random.chance(zoned ? 0.95 : 0.7);
        return s;
    }

    private static String floor(int totalFloors, GeneratorRandom random) {
        double r = random.between(0.0, 1.0);
        if (r < 0.03) return "BASEMENT";
        if (r < 0.10) return "GROUND";
        if (r < 0.14) return "GARDEN";
        if (r < 0.18) return "HIGH_ENTRANCE";
        if (r < 0.22 && totalFloors >= 3) return "ROOF";
        return "FLOOR_" + random.between(1, Math.min(totalFloors, 40));
    }

    private static double ageFactor(Integer age) {
        if (age == null) return 1.0;
        return age == 0 ? 1.15 : age <= 5 ? 1.08 : age <= 15 ? 1.0 : age <= 30 ? 0.88 : 0.78;
    }

    private static double floorFactor(String floorKey) {
        if (floorKey == null) return 1.0;
        return switch (floorKey) {
            case "BASEMENT" -> 0.8;
            case "GROUND", "GARDEN", "HIGH_ENTRANCE" -> 0.93;
            case "ROOF" -> 0.95;
            default -> 1.0;
        };
    }

    private static Map<String, Object> attributes(Kind kind, boolean rent, Spec s, BigDecimal price, GeneratorRandom random) {
        Map<String, Object> a = new LinkedHashMap<>();
        if (kind.land()) {
            a.put("deedStatus", random.weighted(w("DETACHED_TITLE", 60, "SHARED", 40)));
            if ("FARM".equals(kind.type())) {
                a.put("waterSource", random.weighted(w("MAINS", 15, "WELL", 50, "SPRING", 10, "NONE", 25)));
            }
            return a;
        }
        a.put("deedStatus", s.buildingAge != null && s.buildingAge == 0 && random.chance(0.4) ? "CONSTRUCTION_SERVITUDE"
                : random.weighted(w("CONDOMINIUM", 90, "SHARED", 7, "COOPERATIVE", 3)));
        if (!"BUILDING".equals(kind.type())) {
            a.put("usageStatus", rent ? random.weighted(w("EMPTY", 85, "OWNER", 15))
                    : random.weighted(w("EMPTY", 50, "TENANT", 30, "OWNER", 20)));
            List<String> facades = new ArrayList<>(List.of("NORTH", "SOUTH", "EAST", "WEST"));
            int count = random.between(1, 3);
            List<String> picked = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                picked.add(facades.remove(random.between(0, facades.size() - 1)));
            }
            a.put("facades", picked);
        }
        if (rent) {
            a.put("deposit", price.multiply(BigDecimal.valueOf(random.pick(List.of(1, 1, 2, 2, 3)))));
            a.put("minLeaseMonths", random.weighted(w(12, 80, 6, 10, 24, 10)));
        } else if (kind.residential()) {
            a.put("loanEligible", "CONDOMINIUM".equals(a.get("deedStatus")) && random.chance(0.8));
        }
        return a;
    }

    private static final Map<String, String> TYPE_WORD = Map.ofEntries(
            Map.entry("APARTMENT", "daire"), Map.entry("RESIDENCE", "rezidans dairesi"), Map.entry("STUDIO", "stüdyo daire"),
            Map.entry("DUPLEX", "dubleks daire"), Map.entry("VILLA", "villa"), Map.entry("LAND", "arsa"),
            Map.entry("COMMERCIAL_LAND", "ticari arsa"), Map.entry("FARM", "tarla"), Map.entry("OFFICE", "ofis"),
            Map.entry("COMMERCIAL", "dükkan"), Map.entry("WAREHOUSE", "depo"), Map.entry("BUILDING", "komple bina"));

    private static String title(Kind kind, boolean rent, Spec s, GeneratorLocations.Place place) {
        StringBuilder t = new StringBuilder(locative(place.districtLabel())).append(rent ? " kiralık " : " satılık ");
        if (s.roomConfig != null) {
            t.append(ROOM_LABEL.get(s.roomConfig)).append(' ');
        }
        t.append(TYPE_WORD.get(kind.type())).append(", ").append(s.gross).append(" m²");
        if (s.inSite) t.append(", site içinde");
        else if (s.parking && kind.residential()) t.append(", otoparklı");
        else if (s.buildingAge != null && s.buildingAge == 0) t.append(", sıfır bina");
        else if (s.zoning != null && "RESIDENTIAL_ZONED".equals(s.zoning)) t.append(", konut imarlı");
        return t.toString();
    }

    private static String description(Kind kind, boolean rent, Spec s, GeneratorLocations.Place place) {
        StringBuilder d = new StringBuilder();
        d.append(place.cityLabel()).append(' ').append(place.districtLabel()).append(" bölgesinde ")
                .append(rent ? "kiralık " : "satılık ").append(TYPE_WORD.get(kind.type())).append(". ");
        if (s.net != null) {
            d.append("Brüt ").append(s.gross).append(" m², net ").append(s.net).append(" m². ");
        } else {
            d.append(s.gross).append(" m² yüzölçümü. ");
        }
        if (s.buildingAge != null) {
            d.append(s.buildingAge == 0 ? "Bina yeni teslim. " : "Bina " + s.buildingAge + " yaşında. ");
        }
        if (s.elevator) d.append("Asansörlü. ");
        if (s.inSite) d.append("Site içinde").append(s.pool ? ", havuzlu" : "").append(". ");
        if (s.zoning != null && s.roadAccess) d.append("Yola cephesi var. ");
        d.append(rent ? "Ayrıntılar ve görüntülü görüşme için mesaj atabilirsiniz." : "Ciddi alıcılarla görüşülür.");
        return d.toString();
    }

    /** Insertion-ordered weights (Map.of order changes between JVM runs, which would break the seed). */
    @SuppressWarnings("unchecked")
    private static <T> Map<T, Integer> w(Object... keyWeightPairs) {
        Map<T, Integer> weights = new LinkedHashMap<>();
        for (int i = 0; i < keyWeightPairs.length; i += 2) {
            weights.put((T) keyWeightPairs[i], (Integer) keyWeightPairs[i + 1]);
        }
        return weights;
    }

    /** "Kadıköy" -> "Kadıköy'de", "Çankaya" -> "Çankaya'da", "Konak" -> "Konak'ta". */
    static String locative(String place) {
        String lower = place.toLowerCase(Locale.forLanguageTag("tr"));
        char lastVowel = 'e';
        for (int i = lower.length() - 1; i >= 0; i--) {
            if ("aeıioöuü".indexOf(lower.charAt(i)) >= 0) {
                lastVowel = lower.charAt(i);
                break;
            }
        }
        boolean back = "aıou".indexOf(lastVowel) >= 0;
        boolean hard = "fsştkçhp".indexOf(lower.charAt(lower.length() - 1)) >= 0;
        return place + "'" + (hard ? "t" : "d") + (back ? "a" : "e");
    }
}
