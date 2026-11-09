package com.serhat.secondhand.listing.validation.clothing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.BrandSegment;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGroup;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ClothingValidationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private SizeSystemCatalog sizeCatalog;
    private ClothingTypeRulesValidator validator;

    @BeforeEach
    void setUp() {
        sizeCatalog = new SizeSystemCatalog(objectMapper);
        sizeCatalog.load();
        validator = new ClothingTypeRulesValidator(sizeCatalog);
    }

    @Test
    void validSizeForAudiencePasses() {
        ClothingListing listing = listing(jeans(), ClothingAudience.MEN, "JEANS", "W32_L32");
        assertThat(validator.validate(listing).isSuccess()).isTrue();
    }

    @Test
    void typeNotOfferedForAudienceFails() {
        ClothingListing listing = listing(dress(), ClothingAudience.MEN, "LETTER", "M");
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_TYPE_NOT_FOR_AUDIENCE");
    }

    @Test
    void sizeSystemOutsideTheTypeRulesFails() {
        ClothingListing listing = listing(jeans(), ClothingAudience.MEN, "LETTER", "M");
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_SIZE_SYSTEM_INVALID");
    }

    @Test
    void unknownSizeValueFails() {
        ClothingListing listing = listing(dress(), ClothingAudience.WOMEN, "WOMEN_NUMERIC", "37");
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_SIZE_INVALID");
    }

    @Test
    void missingSizeFails() {
        ClothingListing listing = listing(dress(), ClothingAudience.WOMEN, null, null);
        validator.cleanup(listing);
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_SIZE_REQUIRED");
    }

    @Test
    void oneSizeTypeNeedsNoSizeFromTheSeller() {
        ClothingListing listing = listing(watch(), ClothingAudience.UNISEX, null, null);
        validator.cleanup(listing);
        assertThat(listing.getSizeSystem()).isEqualTo(SizeSystemCatalog.ONE_SIZE);
        assertThat(listing.getSizeKey()).isEqualTo(SizeSystemCatalog.ONE_SIZE);
        assertThat(validator.validate(listing).isSuccess()).isTrue();
    }

    @Test
    void cleanupClearsHiddenFields() {
        ClothingListing listing = listing(watch(), ClothingAudience.WOMEN, null, null);
        listing.setFit(ClothingFit.SLIM);
        listing.setPattern(ClothingPattern.FLORAL);
        validator.cleanup(listing);
        assertThat(listing.getFit()).isNull();
        assertThat(listing.getPattern()).isNull();
    }

    @Test
    void flawedItemNeedsADefect() {
        ClothingListing listing = listing(jeans(), ClothingAudience.WOMEN, "WOMEN_NUMERIC", "38");
        listing.setCondition(ClothingCondition.FLAWED);
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_DEFECTS_REQUIRED");

        listing.getAttributes().put("defects", List.of("STAIN"));
        assertThat(validator.validate(listing).isSuccess()).isTrue();
    }

    @Test
    void futurePurchaseYearFails() {
        ClothingListing listing = listing(jeans(), ClothingAudience.MEN, "JEANS", "W32_L32");
        listing.setPurchaseYear(java.time.Year.now().getValue() + 1);
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("CLOTHING_PURCHASE_YEAR_INVALID");
    }

    @Test
    void typeWithoutRulesFails() {
        ClothingType bare = new ClothingType();
        bare.setName("BARE");
        Result<Void> result = validator.validate(listing(bare, ClothingAudience.MEN, "LETTER", "M"));
        assertThat(result.getErrorCode()).isEqualTo("CLOTHING_TYPE_RULES_MISSING");
    }

    private ClothingListing listing(ClothingType type, ClothingAudience audience, String system, String key) {
        ClothingListing listing = new ClothingListing();
        listing.setClothingType(type);
        listing.setAudience(audience);
        listing.setSizeSystem(system);
        listing.setSizeKey(key);
        listing.setCondition(ClothingCondition.GOOD);
        return listing;
    }

    private ClothingType jeans() {
        return type("JEANS", ClothingGroup.APPAREL,
                Map.of("WOMEN", List.of("JEANS", "WOMEN_NUMERIC"), "MEN", List.of("JEANS")), SpecFieldRule.OPTIONAL);
    }

    private ClothingType dress() {
        return type("DRESS", ClothingGroup.APPAREL, Map.of("WOMEN", List.of("WOMEN_NUMERIC", "LETTER")), SpecFieldRule.OPTIONAL);
    }

    private ClothingType watch() {
        return type("WATCH", ClothingGroup.ACCESSORY,
                Map.of("WOMEN", List.of("ONE_SIZE"), "UNISEX", List.of("ONE_SIZE")), SpecFieldRule.HIDDEN);
    }

    private ClothingType type(String name, ClothingGroup group, Map<String, List<String>> sizes, SpecFieldRule fieldRule) {
        ClothingType type = new ClothingType();
        type.setName(name);
        type.setLabel(name);
        type.setGroup(group);
        type.setSizeRules(new LinkedHashMap<>(sizes));
        type.setFieldRules(new LinkedHashMap<>(Map.of("fit", fieldRule, "pattern", fieldRule, "fabricType", fieldRule)));
        return type;
    }

    @Nested
    class CatalogIntegrity {

        @Test
        void everyTypeHasAGroupAndKnownAudiencesAndSizeSystems() throws Exception {
            JsonNode root = read("data/clothing/types.json");
            assertThat(root.size()).isGreaterThanOrEqualTo(50);
            Set<String> keys = new HashSet<>();
            for (JsonNode type : root) {
                String key = type.get("key").asText();
                assertThat(keys.add(key)).as("duplicate type %s", key).isTrue();
                ClothingGroup.valueOf(type.get("group").asText());
                assertThat(type.get("sizes").size()).as("%s offers no audience", key).isPositive();
                type.get("sizes").fields().forEachRemaining(e -> {
                    ClothingAudience.valueOf(e.getKey());
                    assertThat(e.getValue().size()).as("%s/%s has no size system", key, e.getKey()).isPositive();
                    e.getValue().forEach(s -> assertThat(sizeCatalog.contains(s.asText()))
                            .as("%s uses unknown size system %s", key, s.asText()).isTrue());
                });
                type.get("fields").fields().forEachRemaining(e -> SpecFieldRule.valueOf(e.getValue().asText()));
            }
            assertThat(keys).contains("BLOUSE", "TUNIC", "JUMPSUIT", "TRENCH_COAT", "RAINCOAT", "LOAFERS", "CLUTCH", "SUITCASE");
            assertThat(keys).doesNotContain("OVERCOAT", "BIKINI");
        }

        @Test
        void everyBrandHasASegment() throws Exception {
            JsonNode root = read("data/clothing/brands.json");
            Set<String> keys = new HashSet<>();
            for (JsonNode brand : root) {
                keys.add(brand.get("key").asText());
                BrandSegment.valueOf(brand.get("segment").asText());
            }
            assertThat(keys).contains("IPEKYOL", "KIGILI", "PENTI", "DR_MARTENS", "MICHAEL_KORS", "OTHER");
            assertThat(keys).doesNotContain("IPEYKOL", "BTWIN", "ROCKRIDER");
            assertThat(root.size()).isGreaterThanOrEqualTo(90);
        }

        private JsonNode read(String path) throws Exception {
            try (InputStream is = new ClassPathResource(path).getInputStream()) {
                return objectMapper.readTree(is);
            }
        }
    }
}
