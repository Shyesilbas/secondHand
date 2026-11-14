package com.serhat.secondhand.listing.application.generator;

import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.application.vehicle.VehicleListingService;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeOptionDto;
import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeOption;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Builds realistic vehicle listings from catalog versions that carry every fact the type requires (fuel, gearbox,
 * generation body type), so the catalog snapshot fills the technical fields and nothing is guessed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
class VehicleListingGenerator {

    private final JdbcTemplate jdbcTemplate;
    private final VehicleListingService vehicleListingService;
    private final ListingAttributeCatalogService attributeCatalogService;

    private static final java.util.Set<String> MODERN_OPTIONS = java.util.Set.of("APPLE_CARPLAY_ANDROID_AUTO", "CAMERA_360",
            "ADAPTIVE_CRUISE", "LANE_ASSIST", "BLIND_SPOT", "DIGITAL_COCKPIT", "PANORAMIC_ROOF");
    private static final Map<String, Integer> ANNUAL_KM = Map.of("CAR", 15_000, "COMMERCIAL", 28_000, "MOTORCYCLE", 5_000);

    private static final Map<Color, Integer> COLORS = Map.of(
            Color.WHITE, 30, Color.GRAY, 18, Color.BLACK, 15, Color.SILVER, 10, Color.BLUE, 8,
            Color.RED, 6, Color.MIDNIGHT_BLUE, 4, Color.BROWN, 3, Color.BEIGE, 3, Color.GREEN, 3);

    private static final List<String> CLOSINGS = List.of(
            "Takas düşünmüyorum.", "Ciddi alıcılar arayabilir.", "Ekspertize açığım, istediğiniz yerde baktırabilirsiniz.",
            "Fiyatta küçük bir pazarlık payı var.", "Hafta içi akşam saatlerinde görülebilir.",
            "Aracı acil satıyorum, gelen teklifleri değerlendiririm.");

    record Version(UUID id, String name, int horsePower, int fromYear, int toYear) {
    }

    record Candidate(GeneratorPrices.VehiclePrice price, String typeName, UUID typeId, UUID brandId, String brandLabel,
                     UUID modelId, String modelName, UUID generationId, List<Version> versions, List<UUID> trims) {
    }

    /** Resolves every price entry to its catalog generation and usable versions; unknown names fail the run. */
    List<Candidate> candidates(List<GeneratorPrices.VehiclePrice> prices) {
        int currentYear = LocalDate.now().getYear();
        List<Candidate> out = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        for (GeneratorPrices.VehiclePrice p : prices) {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                    SELECT t.id AS type_id, t.name AS type_name, b.id AS brand_id, b.label AS brand_label,
                           m.id AS model_id, m.name AS model_name, g.id AS generation_id, g.start_year, g.end_year, g.body_type
                    FROM vehicle_generations g
                    JOIN vehicle_models m ON m.id = g.vehicle_model_id
                    JOIN car_brands b ON b.id = m.car_brand_id
                    JOIN vehicle_types t ON t.id = m.vehicle_type_id
                    WHERE b.name = ? AND m.name = ? AND g.name = ?
                    """, p.brand(), p.model(), p.generation());
            if (rows.size() != 1) {
                throw new IllegalStateException("prices.json vehicle '" + p.brand() + " / " + p.model() + " / "
                        + p.generation() + "' matches " + rows.size() + " catalog generations, expected 1");
            }
            Map<String, Object> g = rows.get(0);
            if (g.get("body_type") == null) {
                skipped.add(p.generation() + " (no body type)");
                continue;
            }
            int genFrom = g.get("start_year") == null ? currentYear : ((Number) g.get("start_year")).intValue();
            int genTo = g.get("end_year") == null ? currentYear : Math.min(currentYear, ((Number) g.get("end_year")).intValue());
            UUID generationId = (UUID) g.get("generation_id");
            List<Version> versions = jdbcTemplate.query("""
                    SELECT id, name, horse_power, start_year, end_year FROM vehicle_versions
                    WHERE vehicle_generation_id = ? AND source IS NOT NULL AND fuel_type IS NOT NULL AND gearbox IS NOT NULL
                    ORDER BY horse_power NULLS FIRST, name
                    """, (rs, i) -> {
                int from = Math.max(genFrom, rs.getObject("start_year") == null ? genFrom : rs.getInt("start_year"));
                int to = Math.min(genTo, rs.getObject("end_year") == null ? genTo : rs.getInt("end_year"));
                return new Version(rs.getObject("id", UUID.class), rs.getString("name"), rs.getInt("horse_power"), from, to);
            }, generationId).stream().filter(v -> v.fromYear() <= v.toYear()).toList();
            if (versions.isEmpty()) {
                skipped.add(p.generation() + " (no version with fuel and gearbox)");
                continue;
            }
            List<UUID> trims = jdbcTemplate.queryForList(
                    "SELECT id FROM vehicle_trims WHERE vehicle_generation_id = ?", UUID.class, generationId);
            out.add(new Candidate(p, (String) g.get("type_name"), (UUID) g.get("type_id"), (UUID) g.get("brand_id"),
                    (String) g.get("brand_label"), (UUID) g.get("model_id"), (String) g.get("model_name"),
                    generationId, versions, trims));
        }
        if (!skipped.isEmpty()) {
            log.warn("Listing generator skips {} vehicle generation(s) with incomplete catalog facts: {}", skipped.size(), skipped);
        }
        if (out.isEmpty()) {
            throw new IllegalStateException("No vehicle generation in prices.json has complete catalog facts");
        }
        return out;
    }

    /** Creates one listing through the regular create flow and returns its id. */
    UUID create(Candidate c, Long sellerId, GeneratorRandom random, GeneratorLocations.Place place,
                List<GeneratorPhotos.Photo> photos) {
        GeneratorPhotos.Photo photo = photos.isEmpty() ? null : random.pick(photos);
        Color color = photo != null && photo.color() != null ? photo.color() : random.weighted(COLORS);
        int currentYear = LocalDate.now().getYear();
        Version version = c.versions().get(random.between(0, c.versions().size() - 1));
        int year = random.between(version.fromYear(), version.toYear());
        double age = Math.max(0.3, currentYear - year + 0.5);
        int annualKm = ANNUAL_KM.getOrDefault(c.typeName(), 15_000);
        int mileage = (int) (Math.round(annualKm * age * random.between(0.55, 1.5) / 500.0) * 500);

        Map<String, AttributeDefinitionDto> defs = ListingGeneratorSupport.listingAttributes(
                attributeCatalogService, ListingType.VEHICLE, c.typeName());
        Condition cond = condition(random, age, year, defs);

        double price = random.between(c.price().low(), c.price().high())
                * Math.pow(0.92, c.price().anchorYear() - year)
                * clamp(1 - 0.05 * (mileage - annualKm * age) / annualKm, 0.8, 1.1)
                * powerFactor(c.versions(), version)
                * cond.priceFactor();

        String title = ListingGeneratorSupport.truncate(year + " " + c.brandLabel() + " " + c.modelName() + " " + version.name()
                + " · " + ListingGeneratorSupport.formatGroupedInt(mileage) + " km", 100);
        BaseListingCreateRequest base = ListingGeneratorSupport.baseRequest(
                title,
                description(c, version, year, mileage, cond, random),
                GeneratorRandom.roundPrice(price),
                place,
                photo != null ? photo.url() : null,
                random.chance(0.7));
        UUID trimId = c.trims().isEmpty() || random.chance(0.4) ? null : random.pick(c.trims());
        LocalDate inspection = age >= 3 ? LocalDate.now().plusDays(random.between(30, 700)) : null;

        VehicleCreateRequest request = new VehicleCreateRequest(base, c.typeId(), c.brandId(), c.modelId(),
                c.generationId(), version.id(), trimId, version.id(), year, mileage,
                null, null, null, null, null, color, null, null, null, null, null,
                cond.accident(), cond.accident() ? cond.accidentText() : null, inspection, null, null, cond.attributes());
        return ListingGeneratorSupport.requireCreated(
                vehicleListingService.createVehicleListing(request, sellerId),
                "vehicle",
                c.price().generation() + " / " + version.name() + " / " + year);
    }

    private record Condition(Map<String, Object> attributes, double priceFactor, boolean accident, String accidentText,
                             int paintedParts, int changedParts, long tramer, int ownerCount, String service,
                             List<String> optionLabels) {
    }

    /** Condition answers for the attribute keys this vehicle type defines. */
    private Condition condition(GeneratorRandom random, double age, int year, Map<String, AttributeDefinitionDto> defs) {
        Map<String, Object> attrs = new LinkedHashMap<>();
        double factor = 1.0;
        int painted = 0;
        int changed = 0;
        long tramer = 0;

        if (defs.containsKey("sellerKind")) attrs.put("sellerKind", "OWNER");
        AttributeDefinitionDto damage = defs.get("damageMap");
        if (damage != null && random.chance(Math.min(0.75, 0.25 + age * 0.05))) {
            List<String> parts = new ArrayList<>(values(damage, ListingAttributeOption.GROUP_KEY));
            java.util.Collections.shuffle(parts, new java.util.Random(random.between(0, Integer.MAX_VALUE - 1)));
            Map<String, String> map = new LinkedHashMap<>();
            int n = random.between(1, 4);
            for (String part : parts.subList(0, Math.min(n, parts.size()))) {
                String state = random.chance(0.2) ? "CHANGED" : random.chance(0.5) ? "LOCAL_PAINTED" : "PAINTED";
                map.put(part, state);
                if ("CHANGED".equals(state)) changed++; else painted++;
            }
            attrs.put("damageMap", map);
            factor *= 1 - 0.015 * painted - 0.03 * changed;
        }
        if (defs.containsKey("tramerAmount")) {
            boolean hasRecord = (painted + changed > 0 && random.chance(0.6)) || random.chance(0.08);
            tramer = hasRecord ? random.between(10, 240) * 500L : 0;
            attrs.put("tramerAmount", tramer);
            if (tramer > 0) factor *= random.between(0.92, 0.98);
        }
        boolean heavy = defs.containsKey("heavyDamageRecord") && random.chance(0.02);
        if (defs.containsKey("heavyDamageRecord")) attrs.put("heavyDamageRecord", heavy);
        if (heavy) factor *= 0.75;
        int owners = Math.max(1, Math.min(6, (int) Math.round(1 + age / 4 + random.between(-0.5, 0.8))));
        if (defs.containsKey("ownerCount")) attrs.put("ownerCount", owners);
        String service = age <= 4
                ? (random.chance(0.7) ? "FULL_AUTHORIZED" : "PARTIAL")
                : (random.chance(0.3) ? "FULL_AUTHORIZED" : random.chance(0.7) ? "PARTIAL" : "NONE");
        if (defs.containsKey("serviceHistory")) attrs.put("serviceHistory", service);
        if (defs.containsKey("plateOrigin")) attrs.put("plateOrigin", random.chance(0.98) ? "TR" : "BLUE_PLATE");
        if (defs.containsKey("warranty")) {
            boolean underWarranty = age <= 2.5 && random.chance(0.75);
            attrs.put("warranty", underWarranty ? "MANUFACTURER" : "NONE");
            if (underWarranty && defs.containsKey("warrantyUntil")) {
                LocalDate until = LocalDate.of(year + 3, random.between(1, 12), random.between(1, 28));
                if (until.isAfter(LocalDate.now())) attrs.put("warrantyUntil", until.toString());
            }
        }
        List<String> optionLabels = new ArrayList<>();
        AttributeDefinitionDto options = defs.get("options");
        if (options != null) {
            // Driver-assist and phone-mirroring options were rare before ~2016; keep older cars to the classics.
            List<AttributeOptionDto> all = options.getOptions().stream()
                    .filter(o -> ListingAttributeOption.GROUP_VALUE.equals(o.getGroup()))
                    .filter(o -> year >= 2016 || !MODERN_OPTIONS.contains(o.getValue()))
                    .collect(Collectors.toCollection(ArrayList::new));
            java.util.Collections.shuffle(all, new java.util.Random(random.between(0, Integer.MAX_VALUE - 1)));
            List<AttributeOptionDto> picked = all.subList(0, Math.min(all.size(), random.between(0, 5)));
            if (!picked.isEmpty()) {
                attrs.put("options", picked.stream().map(AttributeOptionDto::getValue).toList());
                picked.forEach(o -> optionLabels.add(o.getLabel()));
            }
        }
        boolean accident = heavy || tramer >= 40_000;
        String accidentText = heavy ? "Ağır hasar kaydı var, onarımı yapıldı."
                : "Tramer kaydı " + ListingGeneratorSupport.formatTry(tramer) + ".";
        return new Condition(attrs, factor, accident, accidentText, painted, changed, tramer, owners, service, optionLabels);
    }

    private String description(Candidate c, Version v, int year, int mileage, Condition cond, GeneratorRandom random) {
        List<String> s = new ArrayList<>();
        s.add(year + " model " + c.brandLabel() + " " + c.modelName() + " " + v.name() + ", "
                + ListingGeneratorSupport.formatGroupedInt(mileage) + " km'de.");
        s.add(cond.ownerCount() == 1 ? "İlk sahibinden, aracın tüm geçmişi bende." : cond.ownerCount() + ". sahibiyim.");
        s.add(switch (cond.service()) {
            case "FULL_AUTHORIZED" -> "Bakımları yetkili serviste zamanında yapıldı.";
            case "PARTIAL" -> "Bakımları düzenli yapıldı, faturaların bir kısmı elimde.";
            default -> "Bakımları özel serviste yapıldı.";
        });
        if (cond.paintedParts() + cond.changedParts() == 0) {
            s.add("Boyasız, değişensiz.");
        } else {
            List<String> parts = new ArrayList<>();
            if (cond.paintedParts() > 0) parts.add(cond.paintedParts() + " parça boyalı");
            if (cond.changedParts() > 0) parts.add(cond.changedParts() + " parça değişen");
            s.add(String.join(", ", parts) + "; detaylar ilandaki boya/değişen şemasında.");
        }
        s.add(cond.tramer() == 0 ? "Tramer kaydı yok." : ListingGeneratorSupport.formatTry(cond.tramer()) + " tramer kaydı var.");
        if (!cond.optionLabels().isEmpty()) s.add("Donanım: " + String.join(", ", cond.optionLabels()) + ".");
        s.add(random.pick(CLOSINGS));
        return String.join(" ", s);
    }

    private static List<String> values(AttributeDefinitionDto def, String group) {
        return def.getOptions().stream().filter(o -> group.equals(o.getGroup())).map(AttributeOptionDto::getValue).toList();
    }

    /** Stronger versions of a generation ask a little more (±6 % from the weakest to the strongest). */
    private static double powerFactor(List<Version> versions, Version v) {
        List<Version> sorted = versions.stream().sorted(Comparator.comparingInt(Version::horsePower)).toList();
        if (sorted.size() < 2) return 1.0;
        double pos = (double) sorted.indexOf(v) / (sorted.size() - 1);
        return 0.94 + 0.12 * pos;
    }

    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }
}
