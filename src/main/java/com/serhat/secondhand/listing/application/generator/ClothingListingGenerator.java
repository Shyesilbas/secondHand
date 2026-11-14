package com.serhat.secondhand.listing.application.generator;

import static com.serhat.secondhand.listing.application.generator.GeneratorRandom.weights;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.clothing.ClothingListingService;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.BrandSegment;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGroup;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Generated clothing listings (no photos): a type by popularity, an audience the type is offered for (women most),
 * a brand that sells that type, a mid-range size of an allowed system, and a price from the type's estimated new
 * price (claude-draft, TRY, late 2026) times brand segment and condition. Flawed items name their defects; some
 * listings add season, measurements or proof of authenticity.
 */
@Component
@RequiredArgsConstructor
class ClothingListingGenerator {

    record Type(UUID id, String name, String label, ClothingGroup group, Map<String, List<String>> sizeRules,
                Map<String, SpecFieldRule> fieldRules) {
    }

    record Brand(UUID id, String name, String label, BrandSegment segment) {
    }

    record Catalog(List<Type> types, List<Brand> brands) {
    }

    /** What a brand sells: type keys and, when not everyone, the audiences. */
    private record Kind(Set<String> types, Set<ClothingAudience> audiences) {
    }

    private static final Set<ClothingAudience> ALL_AUDIENCES = EnumSet.allOf(ClothingAudience.class);
    private static final Set<ClothingAudience> ADULTS = EnumSet.of(ClothingAudience.WOMEN, ClothingAudience.MEN, ClothingAudience.UNISEX);
    private static final Set<String> FOOTWEAR = Set.of("SNEAKERS", "BOOTS", "SANDALS", "SLIPPERS", "HEELS", "FLATS", "LOAFERS", "SHOES");
    private static final Set<String> BAGS = Set.of("BAG", "BACKPACK", "HANDBAG", "CROSSBODY_BAG", "CLUTCH", "WALLET");
    private static final Set<String> JEWELRY = Set.of("NECKLACE", "BRACELET", "EARRINGS", "RING", "JEWELRY");

    private static final Kind GENERAL = new Kind(null, ALL_AUDIENCES);
    private static final Kind WOMENSWEAR = new Kind(null, EnumSet.of(ClothingAudience.WOMEN));
    private static final Kind SPORT = new Kind(Set.of("T_SHIRT", "HOODIE", "SWEATSHIRT", "SHORTS", "LEGGINGS", "TRACKSUIT",
            "JACKET", "COAT", "WINDBREAKER", "RAINCOAT", "VEST", "PANTS", "SWIMWEAR", "SOCKS", "SNEAKERS", "BOOTS", "SANDALS",
            "SLIPPERS", "BACKPACK", "BAG", "CAP", "BEANIE", "GLOVES"), ALL_AUDIENCES);
    private static final Kind DENIM = new Kind(Set.of("JEANS", "JACKET", "SHIRT", "T_SHIRT", "SWEATSHIRT", "HOODIE", "SHORTS",
            "SKIRT", "DRESS", "PANTS", "SWEATER"), ALL_AUDIENCES);
    private static final Kind SHOES = new Kind(FOOTWEAR, ALL_AUDIENCES);
    private static final Kind LEATHER = new Kind(union(FOOTWEAR, BAGS, Set.of("BELT")), ADULTS);
    private static final Kind LUXURY = new Kind(union(BAGS, Set.of("BELT", "SUNGLASSES", "SCARF", "SNEAKERS", "LOAFERS",
            "HEELS", "BOOTS", "TRENCH_COAT", "COAT", "BLAZER", "JACKET", "T_SHIRT", "SHIRT", "DRESS", "TIE", "SUITCASE")), ADULTS);
    private static final Kind MENSWEAR = new Kind(Set.of("SUIT", "BLAZER", "SHIRT", "PANTS", "COAT", "TRENCH_COAT", "JACKET",
            "SWEATER", "CARDIGAN", "T_SHIRT", "VEST", "JEANS", "TIE", "BOW_TIE", "BELT", "SHOES", "LOAFERS", "WALLET"),
            EnumSet.of(ClothingAudience.MEN, ClothingAudience.BOY));
    private static final Kind INNERWEAR = new Kind(Set.of("UNDERWEAR", "PYJAMA", "SOCKS", "SWIMWEAR", "LEGGINGS", "T_SHIRT",
            "TRACKSUIT"), ALL_AUDIENCES);
    private static final Kind WATCHES = new Kind(Set.of("WATCH"), ADULTS);
    private static final Kind EYEWEAR = new Kind(Set.of("SUNGLASSES"), ADULTS);
    private static final Kind JEWELLER = new Kind(JEWELRY, EnumSet.of(ClothingAudience.WOMEN, ClothingAudience.UNISEX, ClothingAudience.GIRL));

    private static final Map<String, Kind> BRAND_KINDS = Map.ofEntries(
            Map.entry("STRADIVARIUS", WOMENSWEAR), Map.entry("IPEKYOL", WOMENSWEAR), Map.entry("TWIST", WOMENSWEAR),
            Map.entry("YARGICI", WOMENSWEAR),
            Map.entry("NIKE", SPORT), Map.entry("ADIDAS", SPORT), Map.entry("PUMA", SPORT), Map.entry("UNDER_ARMOUR", SPORT),
            Map.entry("NEW_BALANCE", SPORT), Map.entry("ASICS", SPORT), Map.entry("REEBOK", SPORT), Map.entry("FILA", SPORT),
            Map.entry("CHAMPION", SPORT), Map.entry("KINETIX", SPORT), Map.entry("DECATHLON", SPORT), Map.entry("QUECHUA", SPORT),
            Map.entry("DOMYOS", SPORT), Map.entry("KIPSTA", SPORT), Map.entry("TARMAK", SPORT), Map.entry("ARTENGO", SPORT),
            Map.entry("KALENJI", SPORT), Map.entry("NABAIJI", SPORT), Map.entry("WEDZE", SPORT), Map.entry("SOLOGNAC", SPORT),
            Map.entry("SALOMON", SPORT), Map.entry("THE_NORTH_FACE", SPORT), Map.entry("COLUMBIA", SPORT),
            Map.entry("PATAGONIA", SPORT), Map.entry("JACK_WOLFSKIN", SPORT),
            Map.entry("MAVI", DENIM), Map.entry("COLINS", DENIM), Map.entry("LTB", DENIM), Map.entry("LEVIS", DENIM),
            Map.entry("VANS", SHOES), Map.entry("CONVERSE", SHOES), Map.entry("SKECHERS", SHOES), Map.entry("TIMBERLAND", SHOES),
            Map.entry("CROCS", SHOES), Map.entry("BIRKENSTOCK", SHOES), Map.entry("DR_MARTENS", SHOES), Map.entry("CAMPER", SHOES),
            Map.entry("GREYDER", SHOES), Map.entry("BETA", SHOES), Map.entry("POLARIS", SHOES), Map.entry("FLO", SHOES),
            Map.entry("DERIMOD", LEATHER), Map.entry("KEMAL_TANCA", LEATHER), Map.entry("INCI", LEATHER), Map.entry("HOTIC", LEATHER),
            Map.entry("GUCCI", LUXURY), Map.entry("PRADA", LUXURY), Map.entry("LOUIS_VUITTON", LUXURY), Map.entry("BALENCIAGA", LUXURY),
            Map.entry("BURBERRY", LUXURY), Map.entry("DIOR", LUXURY), Map.entry("CHANEL", LUXURY), Map.entry("HERMES", LUXURY),
            Map.entry("VERSACE", LUXURY), Map.entry("DOLCE_GABBANA", LUXURY), Map.entry("ARMANI", LUXURY),
            Map.entry("MICHAEL_KORS", LUXURY), Map.entry("COACH", LUXURY),
            Map.entry("KIGILI", MENSWEAR), Map.entry("ALTINYILDIZ_CLASSICS", MENSWEAR), Map.entry("SARAR", MENSWEAR),
            Map.entry("DAMAT_TWEEN", MENSWEAR), Map.entry("AVVA", MENSWEAR), Map.entry("LUFIAN", MENSWEAR),
            Map.entry("TUDORS", MENSWEAR), Map.entry("HUGO_BOSS", MENSWEAR),
            Map.entry("PENTI", INNERWEAR), Map.entry("SUWEN", INNERWEAR), Map.entry("OYSHO", INNERWEAR),
            Map.entry("CASIO", WATCHES), Map.entry("SEIKO", WATCHES), Map.entry("RAY_BAN", EYEWEAR),
            Map.entry("PANDORA", JEWELLER), Map.entry("SWAROVSKI", JEWELLER));

    /** Brands that show up most on second-hand sites get a larger share. */
    private static final Set<String> POPULAR = Set.of("ZARA", "H_M", "LC_WAIKIKI", "KOTON", "DEFACTO", "MAVI", "NIKE", "ADIDAS",
            "MANGO", "PULL_BEAR", "BERSHKA");

    /** Estimated new price of a mid-segment adult item (TRY, claude-draft, late 2026). */
    private static final Map<String, Integer> NEW_PRICE = Map.ofEntries(
            Map.entry("T_SHIRT", 700), Map.entry("SHIRT", 1300), Map.entry("BLOUSE", 1100), Map.entry("TUNIC", 1100),
            Map.entry("SWEATER", 1500), Map.entry("HOODIE", 1600), Map.entry("SWEATSHIRT", 1400), Map.entry("CARDIGAN", 1400),
            Map.entry("VEST", 1200), Map.entry("PANTS", 1500), Map.entry("JEANS", 1800), Map.entry("SHORTS", 800),
            Map.entry("LEGGINGS", 700), Map.entry("DRESS", 1800), Map.entry("SKIRT", 1100), Map.entry("JUMPSUIT", 1800),
            Map.entry("SUIT", 7000), Map.entry("JACKET", 3500), Map.entry("COAT", 4500), Map.entry("BLAZER", 3000),
            Map.entry("TRENCH_COAT", 4000), Map.entry("WINDBREAKER", 2000), Map.entry("RAINCOAT", 1800),
            Map.entry("TRACKSUIT", 2500), Map.entry("PYJAMA", 900), Map.entry("UNDERWEAR", 400), Map.entry("SWIMWEAR", 900),
            Map.entry("SOCKS", 200), Map.entry("SNEAKERS", 3500), Map.entry("BOOTS", 4000), Map.entry("SANDALS", 1500),
            Map.entry("SLIPPERS", 700), Map.entry("HEELS", 2200), Map.entry("FLATS", 1500), Map.entry("LOAFERS", 2500),
            Map.entry("SHOES", 3000), Map.entry("BAG", 1500), Map.entry("BACKPACK", 1500), Map.entry("HANDBAG", 1800),
            Map.entry("CROSSBODY_BAG", 1300), Map.entry("CLUTCH", 1000), Map.entry("SUITCASE", 3000), Map.entry("WALLET", 800),
            Map.entry("WATCH", 3500), Map.entry("SUNGLASSES", 2000), Map.entry("NECKLACE", 900), Map.entry("BRACELET", 700),
            Map.entry("EARRINGS", 600), Map.entry("RING", 600), Map.entry("JEWELRY", 900), Map.entry("BELT", 700),
            Map.entry("HAT", 600), Map.entry("CAP", 600), Map.entry("BEANIE", 400), Map.entry("SCARF", 600),
            Map.entry("GLOVES", 500), Map.entry("TIE", 600), Map.entry("BOW_TIE", 400), Map.entry("OTHER", 600));

    /** How often a type is listed; types not named here get 2. */
    private static final Map<String, Integer> TYPE_WEIGHT = Map.ofEntries(
            Map.entry("SNEAKERS", 10), Map.entry("JEANS", 8), Map.entry("DRESS", 8), Map.entry("T_SHIRT", 8),
            Map.entry("JACKET", 8), Map.entry("COAT", 6), Map.entry("HANDBAG", 6), Map.entry("SWEATER", 5),
            Map.entry("SHIRT", 5), Map.entry("BOOTS", 5), Map.entry("HOODIE", 4), Map.entry("SWEATSHIRT", 4),
            Map.entry("BLAZER", 4), Map.entry("PANTS", 4), Map.entry("SKIRT", 4), Map.entry("BAG", 4), Map.entry("BLOUSE", 4),
            Map.entry("HEELS", 3), Map.entry("SUIT", 3), Map.entry("TRENCH_COAT", 3), Map.entry("WATCH", 3),
            Map.entry("BACKPACK", 3), Map.entry("SUNGLASSES", 3), Map.entry("CROSSBODY_BAG", 3), Map.entry("TRACKSUIT", 3),
            Map.entry("UNDERWEAR", 1), Map.entry("SOCKS", 1), Map.entry("BOW_TIE", 1), Map.entry("OTHER", 1));

    private static final Map<ClothingAudience, Integer> AUDIENCE_WEIGHT = Map.of(ClothingAudience.WOMEN, 52,
            ClothingAudience.MEN, 30, ClothingAudience.UNISEX, 6, ClothingAudience.GIRL, 5, ClothingAudience.BOY, 4,
            ClothingAudience.BABY, 3);

    private static final Map<ClothingCondition, Integer> CONDITION_WEIGHT = Map.of(ClothingCondition.NEW_WITH_TAGS, 14,
            ClothingCondition.NEW_WITHOUT_TAGS, 10, ClothingCondition.VERY_GOOD, 40, ClothingCondition.GOOD, 26,
            ClothingCondition.FLAWED, 10);

    private static final Map<ClothingCondition, Double> CONDITION_FACTOR = Map.of(ClothingCondition.NEW_WITH_TAGS, 0.65,
            ClothingCondition.NEW_WITHOUT_TAGS, 0.55, ClothingCondition.VERY_GOOD, 0.45, ClothingCondition.GOOD, 0.33,
            ClothingCondition.FLAWED, 0.18);

    private static final Map<ClothingCondition, String> CONDITION_WORD = Map.of(ClothingCondition.NEW_WITH_TAGS, "etiketli",
            ClothingCondition.NEW_WITHOUT_TAGS, "yeni", ClothingCondition.VERY_GOOD, "az kullanılmış",
            ClothingCondition.GOOD, "temiz", ClothingCondition.FLAWED, "kusurlu");

    private static final Map<ClothingAudience, String> AUDIENCE_WORD = Map.of(ClothingAudience.WOMEN, "kadın",
            ClothingAudience.MEN, "erkek", ClothingAudience.UNISEX, "unisex", ClothingAudience.GIRL, "kız çocuk",
            ClothingAudience.BOY, "erkek çocuk", ClothingAudience.BABY, "bebek");

    private static final Map<Color, Integer> COLORS = weights(Color.BLACK, 22, Color.WHITE, 12, Color.MIDNIGHT_BLUE, 9,
            Color.GRAY, 9, Color.BEIGE, 9, Color.BLUE, 7, Color.BROWN, 7, Color.GREEN, 5, Color.RED, 5, Color.PINK, 5,
            Color.YELLOW, 2, Color.ORANGE, 2, Color.PURPLE, 2);
    private static final Map<Color, Integer> DENIM_COLORS = weights(Color.BLUE, 45, Color.MIDNIGHT_BLUE, 20, Color.BLACK, 20,
            Color.GRAY, 10, Color.WHITE, 5);
    private static final Map<Color, Integer> METAL_COLORS = weights(Color.GOLD, 45, Color.SILVER, 45, Color.BLACK, 10);

    private static final Map<String, List<FabricType>> FABRICS = Map.ofEntries(
            Map.entry("JEANS", List.of(FabricType.DENIM)),
            Map.entry("SWEATER", List.of(FabricType.WOOL, FabricType.COTTON, FabricType.CASHMERE, FabricType.BLEND)),
            Map.entry("CARDIGAN", List.of(FabricType.WOOL, FabricType.COTTON, FabricType.BLEND)),
            Map.entry("COAT", List.of(FabricType.WOOL, FabricType.BLEND, FabricType.POLYESTER)),
            Map.entry("JACKET", List.of(FabricType.POLYESTER, FabricType.LEATHER, FabricType.DENIM, FabricType.NYLON)),
            Map.entry("BLAZER", List.of(FabricType.BLEND, FabricType.WOOL, FabricType.LINEN, FabricType.POLYESTER)),
            Map.entry("SUIT", List.of(FabricType.WOOL, FabricType.BLEND)),
            Map.entry("TRENCH_COAT", List.of(FabricType.COTTON, FabricType.POLYESTER, FabricType.BLEND)),
            Map.entry("WINDBREAKER", List.of(FabricType.NYLON, FabricType.POLYESTER)),
            Map.entry("RAINCOAT", List.of(FabricType.NYLON, FabricType.POLYESTER)),
            Map.entry("DRESS", List.of(FabricType.VISCOSE, FabricType.COTTON, FabricType.POLYESTER, FabricType.LINEN, FabricType.SILK)),
            Map.entry("BLOUSE", List.of(FabricType.VISCOSE, FabricType.SILK, FabricType.COTTON, FabricType.POLYESTER)),
            Map.entry("SHIRT", List.of(FabricType.COTTON, FabricType.LINEN, FabricType.BLEND)),
            Map.entry("LEGGINGS", List.of(FabricType.SYNTHETIC, FabricType.COTTON, FabricType.BLEND)),
            Map.entry("TRACKSUIT", List.of(FabricType.POLYESTER, FabricType.COTTON, FabricType.FLEECE)),
            Map.entry("HOODIE", List.of(FabricType.COTTON, FabricType.FLEECE, FabricType.BLEND)),
            Map.entry("SWEATSHIRT", List.of(FabricType.COTTON, FabricType.FLEECE, FabricType.BLEND)),
            Map.entry("SWIMWEAR", List.of(FabricType.SYNTHETIC, FabricType.NYLON)),
            Map.entry("PYJAMA", List.of(FabricType.COTTON, FabricType.VISCOSE, FabricType.VELVET)),
            Map.entry("UNDERWEAR", List.of(FabricType.COTTON)),
            Map.entry("SOCKS", List.of(FabricType.COTTON, FabricType.WOOL)),
            Map.entry("SNEAKERS", List.of(FabricType.SYNTHETIC, FabricType.LEATHER)),
            Map.entry("BACKPACK", List.of(FabricType.NYLON, FabricType.POLYESTER)),
            Map.entry("SUITCASE", List.of(FabricType.SYNTHETIC)),
            Map.entry("WALLET", List.of(FabricType.LEATHER)),
            Map.entry("BELT", List.of(FabricType.LEATHER)),
            Map.entry("SCARF", List.of(FabricType.WOOL, FabricType.CASHMERE, FabricType.SILK, FabricType.VISCOSE)),
            Map.entry("BEANIE", List.of(FabricType.WOOL, FabricType.FLEECE, FabricType.SYNTHETIC)),
            Map.entry("GLOVES", List.of(FabricType.WOOL, FabricType.FLEECE, FabricType.LEATHER)),
            Map.entry("TIE", List.of(FabricType.SILK, FabricType.POLYESTER)),
            Map.entry("BOW_TIE", List.of(FabricType.SILK, FabricType.POLYESTER)));
    private static final List<FabricType> SHOE_FABRICS = List.of(FabricType.LEATHER, FabricType.LEATHER, FabricType.SYNTHETIC);
    private static final List<FabricType> BAG_FABRICS = List.of(FabricType.LEATHER, FabricType.LEATHER, FabricType.SYNTHETIC,
            FabricType.COTTON, FabricType.NYLON);
    private static final List<FabricType> DEFAULT_FABRICS = List.of(FabricType.COTTON, FabricType.COTTON, FabricType.POLYESTER,
            FabricType.BLEND);

    private static final Set<String> HYGIENE_TYPES = Set.of("UNDERWEAR", "SOCKS", "SWIMWEAR");
    private static final Set<String> TIGHT_FIT_TYPES = Set.of("JEANS", "PANTS", "LEGGINGS");
    private static final Set<String> FLORAL_TYPES = Set.of("DRESS", "BLOUSE", "SKIRT", "TUNIC", "SCARF", "SWIMWEAR", "PYJAMA");
    private static final Set<String> GRAPHIC_TYPES = Set.of("T_SHIRT", "HOODIE", "SWEATSHIRT");
    private static final Set<String> SUMMER_TYPES = Set.of("SHORTS", "SANDALS", "SWIMWEAR", "SLIPPERS", "T_SHIRT", "TUNIC");
    private static final Set<String> WINTER_TYPES = Set.of("COAT", "BOOTS", "SWEATER", "CARDIGAN", "BEANIE", "GLOVES");
    private static final Set<String> TOPS = Set.of("T_SHIRT", "SHIRT", "BLOUSE", "TUNIC", "SWEATER", "HOODIE", "SWEATSHIRT",
            "CARDIGAN", "JACKET", "COAT", "BLAZER", "TRENCH_COAT", "DRESS");
    private static final Set<String> BOTTOMS = Set.of("PANTS", "JEANS", "SHORTS", "LEGGINGS", "SKIRT");

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final SizeSystemCatalog sizeCatalog;
    private final ClothingListingService clothingListingService;

    Catalog catalog() {
        List<Type> types = jdbcTemplate.query("""
                SELECT id, name, label, clothing_group, size_rules::text AS size_rules, field_rules::text AS field_rules
                FROM clothing_types ORDER BY sort_order, name
                """, (rs, i) -> new Type(rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("label"),
                group(rs.getString("name"), rs.getString("clothing_group")),
                read(rs.getString("size_rules"), new TypeReference<>() {}),
                read(rs.getString("field_rules"), new TypeReference<>() {})));
        List<Brand> brands = jdbcTemplate.query("SELECT id, name, label, segment FROM clothing_brands ORDER BY name",
                (rs, i) -> new Brand(rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("label"),
                        segment(rs.getString("name"), rs.getString("segment"))));
        if (types.isEmpty() || brands.stream().noneMatch(b -> "OTHER".equals(b.name()))) {
            throw new IllegalStateException("Clothing catalog is empty or has no OTHER brand; run --app.seed=clothing");
        }
        types.forEach(t -> {
            if (t.sizeRules().isEmpty()) {
                throw new IllegalStateException("Clothing type " + t.name() + " has no size rules; run --app.seed=clothing");
            }
        });
        return new Catalog(types, brands);
    }

    UUID create(Catalog catalog, Long sellerId, GeneratorRandom random, GeneratorLocations.Place place) {
        Type type = random.weighted(catalog.types().stream()
                .collect(Collectors.toMap(t -> t, t -> TYPE_WEIGHT.getOrDefault(t.name(), 2), (a, b) -> a, LinkedHashMap::new)));
        ClothingAudience audience = random.weighted(type.sizeRules().keySet().stream().map(ClothingAudience::valueOf)
                .collect(Collectors.toMap(a -> a, AUDIENCE_WEIGHT::get, (a, b) -> a, LinkedHashMap::new)));
        Brand brand = pickBrand(catalog.brands(), type, audience, random);
        String system = random.pick(type.sizeRules().get(audience.name()));
        String sizeKey = pickSize(system, audience, random);
        // Used underwear, socks and swimwear are not resold; only new ones are listed.
        ClothingCondition condition = HYGIENE_TYPES.contains(type.name())
                ? random.pick(List.of(ClothingCondition.NEW_WITH_TAGS, ClothingCondition.NEW_WITHOUT_TAGS))
                : random.weighted(CONDITION_WEIGHT);
        Color color = random.weighted(type.name().equals("JEANS") ? DENIM_COLORS
                : JEWELRY.contains(type.name()) || type.name().equals("WATCH") ? METAL_COLORS : COLORS);

        ClothingFit fit = ruled(type, "fit", random) ? pickFit(type, random) : null;
        ClothingPattern pattern = ruled(type, "pattern", random) ? pickPattern(type, random) : null;
        FabricType fabric = ruled(type, "fabricType", random) ? pickFabric(type, random) : null;
        Integer purchaseYear = random.chance(0.6) ? Year.now().getValue() - (condition == ClothingCondition.NEW_WITH_TAGS
                ? random.between(0, 1) : random.between(0, 5)) : null;
        Map<String, Object> attributes = attributes(type, audience, brand, condition, system, random);

        double price = NEW_PRICE.getOrDefault(type.name(), 600) * segmentFactor(brand.segment(), type)
                * CONDITION_FACTOR.get(condition) * random.between(0.85, 1.15);
        if (audience == ClothingAudience.GIRL || audience == ClothingAudience.BOY || audience == ClothingAudience.BABY) {
            price *= 0.55;
        }
        String sizeText = sizeText(system, sizeKey);
        String noun = typeNoun(type);
        String brandName = "OTHER".equals(brand.name()) ? null : brand.label();
        String title = Stream.of(brandName, AUDIENCE_WORD.get(audience), color.getLabel().toLowerCase(TR), noun, sizeText)
                .filter(s -> s != null && !s.isBlank()).collect(Collectors.joining(" ")) + ", " + CONDITION_WORD.get(condition);
        title = Character.toUpperCase(title.charAt(0)) + title.substring(1);

        BaseListingCreateRequest base = ListingGeneratorSupport.baseRequest(
                title,
                description(type, brand, audience, condition, sizeText, fabric, purchaseYear, attributes),
                GeneratorRandom.roundPrice(Math.max(50, price)),
                place,
                null,
                random.chance(0.6));
        ClothingCreateRequest request = new ClothingCreateRequest(base, 1, brand.id(), type.id(), color, purchaseYear,
                condition, audience, system, sizeKey, fit, pattern, fabric, attributes);
        return ListingGeneratorSupport.requireCreated(
                clothingListingService.createClothingListing(request, sellerId), "clothing", title);
    }

    private static final Locale TR = Locale.forLanguageTag("tr");

    private Brand pickBrand(List<Brand> brands, Type type, ClothingAudience audience, GeneratorRandom random) {
        boolean kids = !ADULTS.contains(audience);
        Map<Brand, Integer> weights = new LinkedHashMap<>();
        for (Brand b : brands) {
            if ("OTHER".equals(b.name())) {
                weights.put(b, 2);
                continue;
            }
            Kind kind = BRAND_KINDS.getOrDefault(b.name(), GENERAL);
            if (kind.types() != null && !kind.types().contains(type.name())) continue;
            if (!kind.audiences().contains(audience)) continue;
            // Fashion chains do not sell watches or suitcases.
            if (kind.types() == null && (type.name().equals("WATCH") || type.name().equals("SUITCASE"))) continue;
            if (kids && b.segment() != BrandSegment.BUDGET && b.segment() != BrandSegment.MID) continue;
            int w = switch (b.segment()) {
                case BUDGET -> 4;
                case MID -> 5;
                case PREMIUM -> 2;
                case LUXURY -> 1;
            };
            weights.put(b, POPULAR.contains(b.name()) ? w * 3 : w);
        }
        return random.weighted(weights);
    }

    /** Mid-range sizes are the most common; the range depends on the audience. */
    private String pickSize(String system, ClothingAudience audience, GeneratorRandom random) {
        boolean women = audience == ClothingAudience.WOMEN;
        boolean men = audience == ClothingAudience.MEN;
        String key = switch (system) {
            case SizeSystemCatalog.ONE_SIZE -> SizeSystemCatalog.ONE_SIZE;
            case "LETTER" -> random.weighted(women ? weights("XS", 15, "S", 30, "M", 30, "L", 18, "XL", 7)
                    : men ? weights("S", 15, "M", 32, "L", 32, "XL", 15, "XXL", 6)
                    : weights("S", 25, "M", 35, "L", 25, "XL", 15));
            case "WOMEN_NUMERIC" -> random.weighted(weights("34", 15, "36", 30, "38", 30, "40", 17, "42", 8));
            case "MEN_NUMERIC" -> random.weighted(weights("46", 15, "48", 28, "50", 28, "52", 18, "54", 11));
            case "JEANS" -> {
                int waist = women ? random.between(25, 30) : men ? random.between(30, 36) : random.between(27, 34);
                int length = random.pick(women ? List.of(30, 32, 32) : List.of(32, 32, 34));
                yield "W" + waist + "_L" + length;
            }
            case "SHOE_EU" -> String.valueOf(women ? random.between(36, 40) : men ? random.between(41, 45) : random.between(37, 44));
            case "KIDS_SHOE_EU" -> String.valueOf(audience == ClothingAudience.BABY ? random.between(18, 23) : random.between(25, 34));
            default -> random.pick(sizeCatalog.find(system)
                    .orElseThrow(() -> new IllegalStateException("Unknown size system " + system)).values()).key();
        };
        if (sizeCatalog.label(system, key) == null) {
            throw new IllegalStateException("Generator picked size " + key + " that is not in " + system);
        }
        return key;
    }

    private boolean ruled(Type type, String field, GeneratorRandom random) {
        SpecFieldRule rule = type.fieldRules().get(field);
        return rule == SpecFieldRule.REQUIRED || (rule == SpecFieldRule.OPTIONAL && random.chance(0.6));
    }

    private ClothingFit pickFit(Type type, GeneratorRandom random) {
        Map<ClothingFit, Integer> w = weights(ClothingFit.REGULAR, 45, ClothingFit.SLIM, 20, ClothingFit.OVERSIZE, 15,
                ClothingFit.RELAXED, 12, ClothingFit.LOOSE, 4, ClothingFit.ATHLETIC, 4);
        if (TIGHT_FIT_TYPES.contains(type.name())) w.put(ClothingFit.SKINNY, 12);
        return random.weighted(w);
    }

    private ClothingPattern pickPattern(Type type, GeneratorRandom random) {
        Map<ClothingPattern, Integer> w = weights(ClothingPattern.SOLID, 60, ClothingPattern.STRIPED, 8,
                ClothingPattern.CHECKED, 6, ClothingPattern.PRINTED, 8, ClothingPattern.CAMOUFLAGE, 1,
                ClothingPattern.POLKA_DOT, 2, ClothingPattern.ANIMAL_PRINT, 2);
        if (FLORAL_TYPES.contains(type.name())) w.put(ClothingPattern.FLORAL, 10);
        if (GRAPHIC_TYPES.contains(type.name())) w.put(ClothingPattern.GRAPHIC, 12);
        return random.weighted(w);
    }

    private FabricType pickFabric(Type type, GeneratorRandom random) {
        List<FabricType> options = FABRICS.get(type.name());
        if (options == null) {
            options = type.group() == ClothingGroup.FOOTWEAR ? SHOE_FABRICS
                    : BAGS.contains(type.name()) ? BAG_FABRICS : DEFAULT_FABRICS;
        }
        return random.pick(options);
    }

    private Map<String, Object> attributes(Type type, ClothingAudience audience, Brand brand, ClothingCondition condition,
                                           String system, GeneratorRandom random) {
        Map<String, Object> attributes = new LinkedHashMap<>();
        List<String> defectPool = switch (type.group()) {
            case FOOTWEAR -> List.of("WORN_SOLE", "SCRATCH", "STAIN");
            case ACCESSORY -> List.of("SCRATCH", "STAIN", "TEAR", "BROKEN_ZIPPER");
            case APPAREL -> List.of("STAIN", "TEAR", "PILLING", "FADING", "MISSING_BUTTON", "BROKEN_ZIPPER");
        };
        if (condition == ClothingCondition.FLAWED) {
            List<String> defects = new ArrayList<>(List.of(random.pick(defectPool)));
            if (random.chance(0.3)) {
                String second = random.pick(defectPool);
                if (!defects.contains(second)) defects.add(second);
            }
            attributes.put("defects", defects);
        } else if (condition == ClothingCondition.GOOD && type.group() == ClothingGroup.APPAREL && random.chance(0.2)) {
            attributes.put("defects", List.of(random.pick(List.of("PILLING", "FADING"))));
        }
        if (type.group() != ClothingGroup.ACCESSORY && random.chance(0.5)) {
            attributes.put("season", SUMMER_TYPES.contains(type.name()) ? "SUMMER"
                    : WINTER_TYPES.contains(type.name()) ? "WINTER"
                    : random.pick(List.of("ALL_SEASON", "ALL_SEASON", "SPRING_AUTUMN")));
        }
        boolean adult = ADULTS.contains(audience);
        if (type.group() == ClothingGroup.APPAREL && adult && random.chance(0.25)) {
            boolean women = audience == ClothingAudience.WOMEN;
            if (TOPS.contains(type.name())) {
                attributes.put("chestCm", women ? random.between(42, 54) : random.between(50, 62));
                attributes.put("lengthCm", type.name().equals("DRESS") ? random.between(85, 120)
                        : type.name().equals("COAT") || type.name().equals("TRENCH_COAT") ? random.between(85, 110)
                        : random.between(60, 78));
            } else if (BOTTOMS.contains(type.name())) {
                attributes.put("waistCm", women ? random.between(32, 42) : random.between(38, 48));
                if (!type.name().equals("SKIRT") && !type.name().equals("SHORTS")) {
                    attributes.put("inseamCm", "JEANS".equals(system) ? random.between(74, 86) : random.between(70, 84));
                }
            }
        }
        if (type.group() != ClothingGroup.APPAREL
                && (brand.segment() == BrandSegment.LUXURY || brand.segment() == BrandSegment.PREMIUM)) {
            double chance = brand.segment() == BrandSegment.LUXURY ? 0.85 : 0.4;
            if (random.chance(chance)) {
                List<String> proof = new ArrayList<>(List.of("INVOICE"));
                if (random.chance(0.6)) proof.add("BOX");
                if (BAGS.contains(type.name()) && random.chance(0.6)) proof.add("DUST_BAG");
                if (brand.segment() == BrandSegment.LUXURY && random.chance(0.4)) proof.add("CERTIFICATE");
                if (condition == ClothingCondition.NEW_WITH_TAGS) proof.add("TAGS");
                attributes.put("authenticity", proof);
            }
        }
        return attributes;
    }

    private static double segmentFactor(BrandSegment segment, Type type) {
        return switch (segment) {
            case BUDGET -> 0.6;
            case MID -> 1.0;
            case PREMIUM -> 2.2;
            case LUXURY -> BAGS.contains(type.name()) ? 30 : 10;
        };
    }

    /** "38 beden", "42 numara", "W32 / L32", "5 yaş"; null for one-size items. */
    private String sizeText(String system, String key) {
        String label = sizeCatalog.label(system, key);
        return switch (system) {
            case SizeSystemCatalog.ONE_SIZE -> null;
            case "SHOE_EU", "KIDS_SHOE_EU" -> label + " numara";
            case "LETTER", "WOMEN_NUMERIC", "MEN_NUMERIC" -> label + " beden";
            default -> label;
        };
    }

    /** "Ceket / Mont" -> "ceket", "Kot Pantolon (Jean)" -> "kot pantolon". */
    private static String typeNoun(Type type) {
        String label = type.label().split(" / | & ")[0];
        int paren = label.indexOf(" (");
        if (paren > 0) label = label.substring(0, paren);
        return label.trim().toLowerCase(TR);
    }

    private String description(Type type, Brand brand, ClothingAudience audience, ClothingCondition condition,
                               String sizeText, FabricType fabric, Integer purchaseYear, Map<String, Object> attributes) {
        StringBuilder sb = new StringBuilder();
        sb.append("OTHER".equals(brand.name()) ? "Markasız " : brand.label() + " ").append(typeNoun(type))
                .append(" (").append(audience.getLabel().toLowerCase(TR)).append(")");
        if (sizeText != null) sb.append(", ").append(sizeText);
        sb.append(". Durumu: ").append(condition.getLabel().toLowerCase(TR)).append(".");
        if (fabric != null) sb.append(" Kumaş: ").append(fabric.getLabel().toLowerCase(TR)).append(".");
        if (purchaseYear != null) sb.append(" ").append(purchaseYear).append(" yılında aldım.");
        if (attributes.containsKey("defects")) {
            sb.append(" Kusurlarını ilan detayında belirttim, lütfen inceleyin.");
        } else if (condition == ClothingCondition.NEW_WITH_TAGS) {
            sb.append(" Hiç giyilmedi, etiketi üzerinde.");
        } else if (condition == ClothingCondition.VERY_GOOD) {
            sb.append(" Birkaç kez kullanıldı, temiz ve bakımlı.");
        }
        if (attributes.containsKey("authenticity")) sb.append(" Orijinalliğini gösteren belgeler mevcut.");
        sb.append(" Kargo ile gönderebilirim, sigara içilmeyen evden.");
        return sb.toString();
    }

    private static ClothingGroup group(String name, String value) {
        if (value == null) throw new IllegalStateException("Clothing type " + name + " has no group; run --app.seed=clothing");
        return ClothingGroup.valueOf(value);
    }

    private static BrandSegment segment(String name, String value) {
        if (value == null) throw new IllegalStateException("Clothing brand " + name + " has no segment; run --app.seed=clothing");
        return BrandSegment.valueOf(value);
    }

    private <T> T read(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("Cannot read clothing type rules " + json, e);
        }
    }

    @SafeVarargs
    private static Set<String> union(Set<String>... sets) {
        return Stream.of(sets).flatMap(Set::stream).collect(Collectors.toUnmodifiableSet());
    }
}
