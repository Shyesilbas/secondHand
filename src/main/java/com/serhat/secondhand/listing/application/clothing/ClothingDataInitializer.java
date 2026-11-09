package com.serhat.secondhand.listing.application.clothing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.core.seed.SeedKeyNormalizer;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.BrandSegment;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGroup;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * Seeds clothing brands (with price segment) and types (group, picker order, size systems per audience, field
 * rules) from {@code data/clothing/brands.json} and {@code types.json}. Upsert by key; rows the files no longer
 * name are pruned. Fails on an unknown group, segment, audience, size system or field rule.
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
    private final SizeSystemCatalog sizeCatalog;
    private final CacheManager cacheManager;

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
            clearTypeCache();
            seedBrands(loadJson(BRANDS_PATH));
            seedTypes(loadJson(TYPES_PATH));
            legacyPruner.prune("clothing_brands", seenBrands);
            legacyPruner.prune("clothing_types", seenTypes);
            clearTypeCache();
            log.info("Clothing seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Clothing seed failed", e);
            return Result.error("Clothing seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    /** Types are cached in Redis by name; a cached copy would hide the new rules from validation. */
    private void clearTypeCache() {
        Cache cache = cacheManager.getCache("catalog:clothingTypes");
        if (cache != null) {
            cache.clear();
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
            String segment = node.path("segment").asText(null);
            if (segment == null) {
                throw new IllegalStateException(BRANDS_PATH + ": brand " + node.get("key").asText() + " has no segment");
            }
            upsertBrand(node.get("key").asText(), node.get("label").asText(), BrandSegment.valueOf(segment));
        }
    }

    private java.util.UUID generateStableUuid(String key) {
        return java.util.UUID.nameUUIDFromBytes(key.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private void upsertBrand(String key, String label, BrandSegment segment) {
        String normalizedKey = SeedKeyNormalizer.toKey(key);
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
        // Old rows may carry a label-style name ("Nike"); the key is the name everything else matches on.
        if (brand.isNew() || !normalizedKey.equals(brand.getName()) || !Objects.equals(brand.getLabel(), label)
                || brand.getSegment() != segment) {
            brand.setName(normalizedKey);
            brand.setLabel(label);
            brand.setSegment(segment);
            brandRepository.save(brand);
        }
    }

    // ── Type Seeding ────────────────────────────────────────────────────

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) return;
        for (JsonNode node : typesNode) {
            String key = node.get("key").asText();
            upsertType(key, node.get("label").asText(), ClothingGroup.valueOf(node.get("group").asText()),
                    node.path("sortOrder").asInt(0), sizeRules(key, node.get("sizes")), fieldRules(node.get("fields")));
        }
    }

    private Map<String, List<String>> sizeRules(String typeKey, JsonNode sizes) {
        if (sizes == null || !sizes.isObject() || sizes.isEmpty()) {
            throw new IllegalStateException(TYPES_PATH + ": type " + typeKey + " has no sizes");
        }
        Map<String, List<String>> rules = new LinkedHashMap<>();
        sizes.fields().forEachRemaining(e -> {
            ClothingAudience.valueOf(e.getKey());
            List<String> systems = new ArrayList<>();
            for (JsonNode system : e.getValue()) {
                if (!sizeCatalog.contains(system.asText())) {
                    throw new IllegalStateException(TYPES_PATH + ": type " + typeKey + " uses unknown size system "
                            + system.asText());
                }
                systems.add(system.asText());
            }
            if (systems.isEmpty()) {
                throw new IllegalStateException(TYPES_PATH + ": type " + typeKey + " has no size system for " + e.getKey());
            }
            rules.put(e.getKey(), systems);
        });
        return rules;
    }

    private Map<String, SpecFieldRule> fieldRules(JsonNode fields) {
        Map<String, SpecFieldRule> rules = new LinkedHashMap<>();
        if (fields != null) {
            fields.fields().forEachRemaining(e -> rules.put(e.getKey(), SpecFieldRule.valueOf(e.getValue().asText())));
        }
        return rules;
    }

    private void upsertType(String key, String label, ClothingGroup group, int sortOrder,
                            Map<String, List<String>> sizeRules, Map<String, SpecFieldRule> fieldRules) {
        String normalizedKey = SeedKeyNormalizer.toKey(key);
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
        type.setName(normalizedKey);
        type.setLabel(label);
        type.setGroup(group);
        type.setSortOrder(sortOrder);
        type.setSizeRules(sizeRules);
        type.setFieldRules(fieldRules);
        typeRepository.save(type);
    }
}
