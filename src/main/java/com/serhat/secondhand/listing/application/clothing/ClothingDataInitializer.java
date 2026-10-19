package com.serhat.secondhand.listing.application.clothing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Seeds clothing reference data (brands, types) from
 * {@code classpath:seed/clothing.json}.
 *
 * <p>Uses an <b>upsert</b> strategy: existing rows are left untouched,
 * missing rows are created.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClothingDataInitializer implements SeedTask {

    private static final String BRANDS_PATH = "data/clothing/brands.json";
    private static final String TYPES_PATH = "data/clothing/types.json";

    private final ClothingBrandRepository brandRepository;
    private final ClothingTypeRepository typeRepository;
    private final ObjectMapper objectMapper;
    private final CatalogLegacyPruner legacyPruner;

    private final Set<String> seenBrands = new HashSet<>();
    private final Set<String> seenTypes = new HashSet<>();

    @Override
    public String key() {
        return "clothing";
    }

    @Override
    public Result<Void> run() {
        try {
            seenBrands.clear();
            seenTypes.clear();
            seedBrands(loadJson(BRANDS_PATH));
            seedTypes(loadJson(TYPES_PATH));
            legacyPruner.prune("clothing_brands", seenBrands);
            legacyPruner.prune("clothing_types", seenTypes);
            log.info("Clothing seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Clothing seed failed", e);
            return Result.error("Clothing seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private JsonNode loadJson(String path) throws Exception {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    // ── Brand Seeding ───────────────────────────────────────────────────

    private void seedBrands(JsonNode brandsNode) {
        if (brandsNode == null || !brandsNode.isArray()) return;
        for (JsonNode node : brandsNode) {
            upsertBrand(node.get("key").asText(), node.get("label").asText());
        }
    }

    private java.util.UUID generateStableUuid(String key) {
        return java.util.UUID.nameUUIDFromBytes(key.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private void upsertBrand(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(java.util.Locale.ROOT);
        seenBrands.add(normalizedKey);
        Optional<ClothingBrand> existing = brandRepository.findByNameIgnoreCase(normalizedKey);
        ClothingBrand brand;
        if (existing.isPresent()) {
            brand = existing.get();
            brand.setNew(false);
        } else {
            brand = new ClothingBrand();
            brand.setId(generateStableUuid("clothing-brand:" + normalizedKey));
            brand.setName(normalizedKey);
        }
        if (!java.util.Objects.equals(brand.getLabel(), label)) {
            brand.setLabel(label);
            brandRepository.save(brand);
        } else if (brand.isNew()) {
            brandRepository.save(brand);
        }
    }

    // ── Type Seeding ────────────────────────────────────────────────────

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) return;
        for (JsonNode node : typesNode) {
            upsertType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertType(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(java.util.Locale.ROOT);
        seenTypes.add(normalizedKey);
        Optional<ClothingType> existing = typeRepository.findByNameIgnoreCase(normalizedKey);
        ClothingType type;
        if (existing.isPresent()) {
            type = existing.get();
            type.setNew(false);
        } else {
            type = new ClothingType();
            type.setId(generateStableUuid("clothing-type:" + normalizedKey));
            type.setName(normalizedKey);
        }
        if (!java.util.Objects.equals(type.getLabel(), label)) {
            type.setLabel(label);
            typeRepository.save(type);
        } else if (type.isNew()) {
            typeRepository.save(type);
        }
    }
}
