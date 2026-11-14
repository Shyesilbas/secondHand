package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.application.electronics.ElectronicListingService;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicCondition;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Builds realistic electronics listings from catalog models with data: the seller picks a variant and an official
 * color, the catalog snapshot fills the specs, and the condition answers follow the type's attribute definitions.
 */
@Component
@RequiredArgsConstructor
class ElectronicListingGenerator {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final ElectronicListingService electronicListingService;
    private final ListingAttributeCatalogService attributeCatalogService;

    private static final Map<Color, Integer> GENERIC_COLORS = Map.of(
            Color.BLACK, 40, Color.WHITE, 25, Color.GRAY, 15, Color.SILVER, 10, Color.BLUE, 5, Color.RED, 5);
    private static final Map<Integer, Integer> TV_SIZE_WEIGHTS = Map.of(42, 2, 48, 3, 55, 10, 65, 10, 77, 4, 83, 2, 97, 1);
    private static final Map<Integer, Double> TV_SIZE_FACTOR = Map.of(42, 0.7, 48, 0.8, 55, 1.0, 65, 1.45, 77, 2.4, 83, 3.2, 97, 8.0);
    private static final Map<ElectronicCondition, Double> CONDITION_FACTOR = Map.of(
            ElectronicCondition.LIKE_NEW, 1.08, ElectronicCondition.VERY_GOOD, 1.0, ElectronicCondition.GOOD, 0.92,
            ElectronicCondition.FAIR, 0.8, ElectronicCondition.DAMAGED, 0.55);
    private static final Set<String> BATTERY_TYPES = Set.of("MOBILE_PHONE", "TABLET", "LAPTOP", "SMARTWATCH");
    private static final Pattern EARBUDS = Pattern.compile("Buds|AirPods(?! Max)|WF-");
    private static final Pattern HOME_CONSOLE = Pattern.compile("PlayStation 5|Xbox");

    private static final List<String> REASONS = List.of(
            "Yeni modele geçtiğim için satıyorum.", "Hediye geldi, ihtiyacım olmadığı için satıyorum.",
            "Az kullanıldı, ihtiyaç fazlası.", "İş değişikliği nedeniyle satılık.", "Yurt dışına taşındığım için satıyorum.");
    private static final List<String> CLOSINGS = List.of(
            "Elden teslim veya kargo ile gönderebilirim.", "Ciddi alıcılar mesaj atabilir.", "Takas düşünmüyorum.",
            "Görmeden almayın, yüz yüze test edebilirsiniz.", "Fiyatta ufak pazarlık payı var.");

    record Variant(UUID id, String name, Integer ram, Integer storage, String chipset, Integer screenSize, int sortOrder) {
    }

    record ModelColor(String name, Color color) {
    }

    record Candidate(GeneratorPrices.ElectronicPrice price, String typeName, UUID typeId, UUID brandId, String brandLabel,
                     UUID modelId, String modelName, int releaseYear, List<ModelColor> colors, List<Variant> variants) {
    }

    List<Candidate> candidates(List<GeneratorPrices.ElectronicPrice> prices) {
        List<Candidate> out = new ArrayList<>();
        for (GeneratorPrices.ElectronicPrice p : prices) {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                    SELECT t.id AS type_id, t.name AS type_name, b.id AS brand_id, b.label AS brand_label,
                           m.id AS model_id, m.name AS model_name, m.release_year, m.colors::text AS colors
                    FROM electronic_models m
                    JOIN electronic_brands b ON b.id = m.brand_id
                    JOIN electronic_types t ON t.id = m.type_id
                    WHERE t.name = ? AND b.name = ? AND m.name = ? AND m.source IS NOT NULL
                    """, p.type(), p.brand(), p.model());
            if (rows.size() != 1) {
                throw new IllegalStateException("prices.json electronics '" + p.type() + " / " + p.brand() + " / "
                        + p.model() + "' matches " + rows.size() + " catalog models with data, expected 1");
            }
            Map<String, Object> m = rows.get(0);
            UUID modelId = (UUID) m.get("model_id");
            List<Variant> variants = jdbcTemplate.query("""
                    SELECT id, name, ram, storage, chipset, (specs->>'screenSize')::int AS screen_size, sort_order
                    FROM electronic_model_variants WHERE electronic_model_id = ? ORDER BY sort_order, name
                    """, (rs, i) -> new Variant(rs.getObject("id", UUID.class), rs.getString("name"),
                    (Integer) rs.getObject("ram"), (Integer) rs.getObject("storage"), rs.getString("chipset"),
                    (Integer) rs.getObject("screen_size"), rs.getInt("sort_order")), modelId);
            List<ModelColor> colors;
            try {
                List<Map<String, String>> raw = objectMapper.readValue((String) m.get("colors"), new TypeReference<>() {});
                colors = raw.stream().map(c -> new ModelColor(c.get("name"), Color.valueOf(c.get("color")))).toList();
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Unreadable colors on electronic model " + p.model(), e);
            }
            Object release = m.get("release_year");
            int releaseYear = release == null ? LocalDate.now().getYear() - 1 : ((Number) release).intValue();
            out.add(new Candidate(p, (String) m.get("type_name"), (UUID) m.get("type_id"), (UUID) m.get("brand_id"),
                    (String) m.get("brand_label"), modelId, (String) m.get("model_name"), releaseYear, colors, variants));
        }
        if (out.isEmpty()) {
            throw new IllegalStateException("prices.json has no electronics entries");
        }
        return out;
    }

    UUID create(Candidate c, Long sellerId, GeneratorRandom random, GeneratorLocations.Place place,
                List<GeneratorPhotos.Photo> photos) {
        double age = Math.max(0.3, LocalDate.now().getYear() - c.releaseYear() + 0.5);
        Variant variant = pickVariant(c, random);
        GeneratorPhotos.Photo photo = photos.isEmpty() ? null : random.pick(photos);
        // The photo decides the color: its official name if known, else its color, else any official color.
        ModelColor official = photo == null ? null : c.colors().stream()
                .filter(mc -> mc.name().equalsIgnoreCase(photo.colorName())
                        || (photo.colorName() == null && mc.color() == photo.color()))
                .findFirst().orElse(null);
        if (official == null && (photo == null || photo.color() == null) && !c.colors().isEmpty()) {
            official = random.pick(c.colors());
        }
        Color color = official != null ? official.color()
                : photo != null && photo.color() != null ? photo.color() : random.weighted(GENERIC_COLORS);
        ElectronicCondition condition = random.weighted(age < 1
                ? Map.of(ElectronicCondition.LIKE_NEW, 45, ElectronicCondition.VERY_GOOD, 35, ElectronicCondition.GOOD, 15, ElectronicCondition.FAIR, 5)
                : Map.of(ElectronicCondition.LIKE_NEW, 18, ElectronicCondition.VERY_GOOD, 32, ElectronicCondition.GOOD, 30,
                ElectronicCondition.FAIR, 14, ElectronicCondition.DAMAGED, 6));

        Map<String, AttributeDefinitionDto> defs = ListingGeneratorSupport.listingAttributes(
                attributeCatalogService, ListingType.ELECTRONICS, c.typeName());
        Map<String, Object> attrs = attributes(c, condition, age, defs, random);

        boolean invoice = Boolean.TRUE.equals(attrs.get("hasInvoice"));
        boolean warrantyProof = invoice && age < 2 && random.chance(0.7);
        double price = random.between(c.price().low(), c.price().high()) * variantFactor(c, variant)
                * CONDITION_FACTOR.get(condition)
                * (Boolean.TRUE.equals(attrs.get("hasBox")) && invoice ? 1.03 : 1.0);

        String label = c.brandLabel() + " " + c.modelName()
                + (variant != null && c.variants().size() > 1 ? " " + variant.name() : "")
                + (official != null ? " " + official.name() : "");
        // Laptop variant names spell out the whole build ("Apple M3 · 10-core GPU · 16 GB / 512 GB"); titles keep RAM/storage.
        String titleLabel = variant != null && variant.ram() != null && variant.storage() != null && "LAPTOP".equals(c.typeName())
                ? c.brandLabel() + " " + c.modelName() + " " + variant.ram() + " GB / "
                + (variant.storage() >= 1024 ? variant.storage() / 1024 + " TB" : variant.storage() + " GB")
                : label;
        String title = ListingGeneratorSupport.truncate(titleLabel + titleSuffix(attrs, condition), 100);
        BaseListingCreateRequest base = ListingGeneratorSupport.baseRequest(
                title,
                description(label, condition, attrs, random),
                GeneratorRandom.roundPrice(price),
                place,
                photo != null ? photo.url() : null,
                random.chance(0.8));
        ElectronicCreateRequest request = new ElectronicCreateRequest(base, 1, c.typeId(), c.brandId(), c.modelId(),
                variant != null ? variant.id() : null, warrantyProof ? "Türkiye" : null, warrantyProof, c.releaseYear(),
                color, official != null ? official.name() : null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
                condition, attrs);
        return ListingGeneratorSupport.requireCreated(
                electronicListingService.createElectronicListing(request, sellerId),
                "electronics",
                c.typeName() + " / " + c.modelName());
    }

    private static Variant pickVariant(Candidate c, GeneratorRandom random) {
        if (c.variants().isEmpty()) return null;
        if ("TV".equals(c.typeName())) {
            Map<Variant, Integer> weights = new LinkedHashMap<>();
            c.variants().forEach(v -> weights.put(v, TV_SIZE_WEIGHTS.getOrDefault(v.screenSize(), 1)));
            return random.weighted(weights);
        }
        return c.variants().get(random.skewedIndex(c.variants().size()));
    }

    /** Price step of a variant against the model's cheapest one. */
    private static double variantFactor(Candidate c, Variant v) {
        if (v == null) return 1.0;
        if ("TV".equals(c.typeName())) {
            // prices.json TV prices are for the 55" model.
            return TV_SIZE_FACTOR.getOrDefault(v.screenSize(), 1.0);
        }
        if ("LAPTOP".equals(c.typeName())) {
            int minRam = c.variants().stream().map(Variant::ram).filter(java.util.Objects::nonNull).min(Integer::compare).orElse(1);
            int minStorage = c.variants().stream().map(Variant::storage).filter(java.util.Objects::nonNull).min(Integer::compare).orElse(1);
            List<String> bins = c.variants().stream().map(Variant::chipset).distinct().toList();
            double f = Math.pow(1.06, log2((double) nz(v.ram(), minRam) / minRam))
                    * Math.pow(1.06, log2((double) nz(v.storage(), minStorage) / minStorage));
            return f * Math.pow(1.12, Math.max(0, bins.indexOf(v.chipset())));
        }
        return Math.pow(1.07, c.variants().indexOf(v));
    }

    private Map<String, Object> attributes(Candidate c, ElectronicCondition condition, double age,
                                           Map<String, AttributeDefinitionDto> defs, GeneratorRandom random) {
        Map<String, Object> a = new LinkedHashMap<>();
        boolean damaged = condition == ElectronicCondition.DAMAGED || condition == ElectronicCondition.FAIR;
        boolean box = random.chance(Math.max(0.35, 0.8 - age * 0.08));
        boolean invoice = random.chance(Math.max(0.3, 0.7 - age * 0.08));
        put(defs, a, "hasBox", box);
        put(defs, a, "hasInvoice", invoice);
        if (invoice && age < 2 && defs.containsKey("warrantyEndDate")) {
            LocalDate end = LocalDate.of(c.releaseYear() + 2, random.between(1, 12), random.between(1, 28));
            if (end.isAfter(LocalDate.now())) a.put("warrantyEndDate", end.toString());
        }
        if (BATTERY_TYPES.contains(c.typeName())) {
            int health = (int) Math.round(Math.max(74, Math.min(100, 100 - age * random.between(4.5, 9.0))));
            boolean replaced = health < 80 && random.chance(0.35);
            put(defs, a, "batteryHealthPercent", replaced ? 100 : health);
            put(defs, a, "batteryReplaced", replaced);
            put(defs, a, "batteryOriginal", !replaced);
        }
        put(defs, a, "screenReplaced", random.chance(damaged ? 0.25 : 0.03));
        put(defs, a, "bodyReplaced", random.chance(damaged ? 0.15 : 0.02));
        if (c.modelName().startsWith("iPhone")) put(defs, a, "faceIdWorking", random.chance(0.97));
        put(defs, a, "imeiRegistered", random.chance(0.97));
        if ("GAME_CONSOLE".equals(c.typeName())) {
            if (HOME_CONSOLE.matcher(c.modelName()).find()) {
                int controllers = random.weighted(Map.of(1, 60, 2, 35, 3, 5));
                put(defs, a, "controllerCount", controllers);
                put(defs, a, "controllerDrift", random.chance(damaged ? 0.3 : 0.08));
            }
            put(defs, a, "modded", random.chance(0.03));
            put(defs, a, "originalCables", random.chance(0.85));
            put(defs, a, "includedGameCount", random.weighted(Map.of(0, 30, 1, 25, 2, 20, 3, 12, 5, 8, 8, 5)));
        }
        if ("HEADPHONES".equals(c.typeName())) {
            boolean earbuds = EARBUDS.matcher(c.modelName()).find();
            put(defs, a, "batteryCondition", age < 1.5
                    ? (random.chance(0.85) ? "LIKE_NEW" : "REDUCED")
                    : random.weighted(Map.of("LIKE_NEW", 50, "REDUCED", 40, "WEAK", 10)));
            put(defs, a, "bothSidesWorking", random.chance(damaged ? 0.85 : 0.98));
            if (earbuds) put(defs, a, "chargingCaseIncluded", random.chance(0.95));
            else put(defs, a, "earPadsReplaced", random.chance(0.1));
        }
        return a;
    }

    private static void put(Map<String, AttributeDefinitionDto> defs, Map<String, Object> a, String key, Object value) {
        if (defs.containsKey(key)) a.put(key, value);
    }

    private static String titleSuffix(Map<String, Object> a, ElectronicCondition condition) {
        if (a.get("batteryHealthPercent") instanceof Integer h) return " · pil %" + h;
        if (Boolean.TRUE.equals(a.get("hasBox")) && Boolean.TRUE.equals(a.get("hasInvoice"))) return " · kutulu, faturalı";
        return " · " + condition.getLabel().toLowerCase(java.util.Locale.forLanguageTag("tr"));
    }

    private String description(String label, ElectronicCondition condition, Map<String, Object> a, GeneratorRandom random) {
        List<String> s = new ArrayList<>();
        s.add(label + ".");
        s.add(switch (condition) {
            case LIKE_NEW -> "Sıfır ayarında, üzerinde hiçbir çizik yok.";
            case VERY_GOOD -> "Çok temiz kullanıldı, yakından bakınca fark edilmeyecek ufak izler var.";
            case GOOD -> "Normal kullanım izleri var, çalışmasında hiçbir sorun yok.";
            case FAIR -> "Kasada belirgin kullanım izleri var, tüm fonksiyonları çalışıyor.";
            default -> "Hasarlı; detaylar aşağıda, parça veya tamir için uygun.";
        });
        if (a.get("batteryHealthPercent") instanceof Integer h) {
            s.add(Boolean.TRUE.equals(a.get("batteryReplaced")) ? "Pil yetkili serviste yenilendi (%100)." : "Pil sağlığı %" + h + ".");
        }
        if (Boolean.TRUE.equals(a.get("screenReplaced"))) s.add("Ekranı değişti.");
        if (Boolean.FALSE.equals(a.get("bothSidesWorking"))) s.add("Bir tarafta ses sorunu var.");
        if (Boolean.TRUE.equals(a.get("controllerDrift"))) s.add("Kolda hafif drift var.");
        if (a.get("controllerCount") instanceof Integer n) s.add(n + " adet kol ile birlikte.");
        if (a.get("includedGameCount") instanceof Integer g && g > 0) s.add(g + " oyun da veriyorum.");
        List<String> extras = new ArrayList<>();
        if (Boolean.TRUE.equals(a.get("hasBox"))) extras.add("kutusu");
        if (Boolean.TRUE.equals(a.get("hasInvoice"))) extras.add("faturası");
        if (a.containsKey("warrantyEndDate")) extras.add("garantisi (" + a.get("warrantyEndDate") + " tarihine kadar)");
        if (!extras.isEmpty()) s.add(capitalize(String.join(", ", extras)) + " mevcut.");
        s.add(random.pick(REASONS));
        s.add(random.pick(CLOSINGS));
        return String.join(" ", s);
    }

    private static String capitalize(String s) {
        return s.isEmpty() ? s : s.substring(0, 1).toUpperCase(java.util.Locale.forLanguageTag("tr")) + s.substring(1);
    }

    private static int nz(Integer v, int fallback) {
        return v == null ? fallback : v;
    }

    private static double log2(double x) {
        return Math.log(x) / Math.log(2);
    }
}
