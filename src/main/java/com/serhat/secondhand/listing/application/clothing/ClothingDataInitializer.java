package com.serhat.secondhand.listing.application.clothing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
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
import java.util.Optional;

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

    private static final String CATALOG_PATH = "seed/clothing.json";

    private final ClothingBrandRepository brandRepository;
    private final ClothingTypeRepository typeRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "clothing";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            seedBrands(root.get("brands"));
            seedTypes(root.get("types"));
            log.info("Clothing seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Clothing seed failed", e);
            return Result.error("Clothing seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
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

    private void upsertBrand(String key, String label) {
        Optional<ClothingBrand> existing = brandRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ClothingBrand brand = existing.get();
            if (brand.getLabel() == null || brand.getLabel().isBlank()) {
                brand.setLabel(label);
                brandRepository.save(brand);
            }
            return;
        }
        ClothingBrand brand = new ClothingBrand();
        brand.setName(key);
        brand.setLabel(label);
        brandRepository.save(brand);
    }

    // ── Type Seeding ────────────────────────────────────────────────────

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) return;
        for (JsonNode node : typesNode) {
            upsertType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertType(String key, String label) {
        Optional<ClothingType> existing = typeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ClothingType type = existing.get();
            if (type.getLabel() == null || type.getLabel().isBlank()) {
                type.setLabel(label);
                typeRepository.save(type);
            }
            return;
        }
        ClothingType type = new ClothingType();
        type.setName(key);
        type.setLabel(label);
        typeRepository.save(type);
    }
}
