package com.serhat.secondhand.listing.validation.clothing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGroup;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class ClothingValidationTest {

    private final ApparelValidator apparelValidator = new ApparelValidator();
    private final FootwearValidator footwearValidator = new FootwearValidator();
    private final AccessoryValidator accessoryValidator = new AccessoryValidator();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void typesJson_allTypesAreProperlyCategorizedInClothingGroup() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/clothing/types.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        assertThat(root.isArray()).isTrue();
        assertThat(root.size()).isGreaterThanOrEqualTo(53);

        for (JsonNode typeNode : root) {
            String key = typeNode.get("key").asText().toUpperCase(Locale.ROOT);
            String groupStr = typeNode.has("group") ? typeNode.get("group").asText() : null;

            assertThat(groupStr)
                    .as("Type %s in types.json must specify a group", key)
                    .isNotNull();

            ClothingGroup expectedGroup = ClothingGroup.valueOf(groupStr.toUpperCase(Locale.ROOT));
            ClothingGroup actualGroup = ClothingGroup.fromTypeName(key);

            assertThat(actualGroup)
                    .as("ClothingGroup.fromTypeName(%s) must match group in types.json", key)
                    .isEqualTo(expectedGroup);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"SLIPPERS", "LOAFERS", "SNEAKERS", "BOOTS", "SANDALS", "HEELS", "FLATS", "SHOES"})
    void footwearValidator_validatesShoeSizeForFootwear(String typeName) {
        ClothingListing listing = createListing(typeName);

        Result<Void> errorResult = footwearValidator.validate(listing);
        assertThat(errorResult.isError()).isTrue();
        assertThat(errorResult.getErrorCode()).isEqualTo("CLOTHING_SHOE_SIZE_REQUIRED");

        // Apparel validator should NOT require clothing size for footwear
        Result<Void> apparelResult = apparelValidator.validate(listing);
        assertThat(apparelResult.isSuccess()).isTrue();

        // Valid shoe size
        listing.setShoeSizeEu(42);
        listing.setSize(ClothingSize.M);
        assertThat(footwearValidator.validate(listing).isSuccess()).isTrue();

        // Footwear cleanup removes clothing size
        footwearValidator.cleanup(listing);
        assertThat(listing.getSize()).isNull();
        assertThat(listing.getShoeSizeEu()).isEqualTo(42);
    }

    @ParameterizedTest
    @ValueSource(strings = {"CARDIGAN", "LEGGINGS", "TRENCH_COAT", "WINDBREAKER", "PYJAMA", "TRACKSUIT", "SWIMWEAR", "BIKINI", "T_SHIRT", "DRESS"})
    void apparelValidator_validatesSizeForApparel(String typeName) {
        ClothingListing listing = createListing(typeName);

        Result<Void> errorResult = apparelValidator.validate(listing);
        assertThat(errorResult.isError()).isTrue();
        assertThat(errorResult.getErrorCode()).isEqualTo("CLOTHING_SIZE_REQUIRED");

        // Footwear validator should NOT require shoe size for apparel
        Result<Void> footwearResult = footwearValidator.validate(listing);
        assertThat(footwearResult.isSuccess()).isTrue();

        // Valid size
        listing.setSize(ClothingSize.L);
        listing.setShoeSizeEu(42);
        assertThat(apparelValidator.validate(listing).isSuccess()).isTrue();

        // Apparel cleanup removes shoe size
        apparelValidator.cleanup(listing);
        assertThat(listing.getShoeSizeEu()).isNull();
        assertThat(listing.getSize()).isEqualTo(ClothingSize.L);
    }

    @ParameterizedTest
    @ValueSource(strings = {"WATCH", "SUNGLASSES", "WALLET", "JEWELRY", "NECKLACE", "BRACELET", "EARRINGS", "RING", "BACKPACK", "HANDBAG", "CROSSBODY_BAG", "BEANIE", "BOW_TIE", "OTHER"})
    void accessoryValidator_allowsAccessoriesWithoutSizeOrShoeSize(String typeName) {
        ClothingListing listing = createListing(typeName);

        // Neither apparel nor footwear validator should require size
        assertThat(apparelValidator.validate(listing).isSuccess()).isTrue();
        assertThat(footwearValidator.validate(listing).isSuccess()).isTrue();
        assertThat(accessoryValidator.validate(listing).isSuccess()).isTrue();

        listing.setSize(ClothingSize.S);
        listing.setShoeSizeEu(40);

        // Accessory cleanup removes both size and shoe size
        accessoryValidator.cleanup(listing);
        assertThat(listing.getSize()).isNull();
        assertThat(listing.getShoeSizeEu()).isNull();
    }

    private ClothingListing createListing(String typeName) {
        ClothingType type = new ClothingType();
        type.setName(typeName);

        ClothingListing listing = new ClothingListing();
        listing.setClothingType(type);
        return listing;
    }

    @Nested
    @DisplayName("Clothing brands and types catalog integrity tests")
    class ClothingCatalogIntegrityTest {

        @Test
        void brandsJson_hasCorrectSpellingAndCleanDecathlonSubbrands() throws Exception {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            org.springframework.core.io.ClassPathResource res =
                    new org.springframework.core.io.ClassPathResource("data/clothing/brands.json");
            assertThat(res.exists()).isTrue();

            com.fasterxml.jackson.databind.JsonNode root;
            try (java.io.InputStream is = res.getInputStream()) {
                root = mapper.readTree(is);
            }

            java.util.Set<String> brandKeys = new java.util.HashSet<>();
            for (com.fasterxml.jackson.databind.JsonNode node : root) {
                brandKeys.add(node.get("key").asText());
            }

            // Typo fixed
            assertThat(brandKeys).contains("IPEKYOL");
            assertThat(brandKeys).doesNotContain("IPEYKOL");

            // Decathlon sports sub-brands removed
            assertThat(brandKeys).doesNotContain("BTWIN", "ROCKRIDER", "TRIBAN", "CAPERLAN", "SIMOND", "OXELO");

            // Key Turkish market clothing / shoe / accessory brands added
            assertThat(brandKeys).contains(
                    "OYSHO", "US_POLO_ASSN", "PIERRE_CARDIN", "KIGILI", "ALTINYILDIZ_CLASSICS",
                    "SARAR", "DAMAT_TWEEN", "AVVA", "LUFIAN", "TUDORS", "PENTI", "SUWEN",
                    "CROCS", "BIRKENSTOCK", "DR_MARTENS", "CAMPER", "REEBOK", "GANT",
                    "NAUTICA", "MICHAEL_KORS", "COACH", "RAY_BAN", "CASIO", "SEIKO", "PANDORA", "SWAROVSKI"
            );

            assertThat(brandKeys).contains("OTHER");
            assertThat(root.size()).isGreaterThanOrEqualTo(90);
        }

        @Test
        void typesJson_hasGroupForAllTypesAndNewTypesExist() throws Exception {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            org.springframework.core.io.ClassPathResource res =
                    new org.springframework.core.io.ClassPathResource("data/clothing/types.json");
            assertThat(res.exists()).isTrue();

            com.fasterxml.jackson.databind.JsonNode root;
            try (java.io.InputStream is = res.getInputStream()) {
                root = mapper.readTree(is);
            }

            java.util.Set<String> typeKeys = new java.util.HashSet<>();
            for (com.fasterxml.jackson.databind.JsonNode node : root) {
                String key = node.get("key").asText();
                String group = node.get("group").asText();
                typeKeys.add(key);
                assertThat(group).isIn("APPAREL", "FOOTWEAR", "ACCESSORY");
            }

            assertThat(typeKeys).contains(
                    "BLOUSE", "TUNIC", "JUMPSUIT", "OVERCOAT",
                    "RAINCOAT", "LOAFERS", "CLUTCH", "SUITCASE"
            );
        }
    }
}
