package com.serhat.secondhand.listing.application.electronics;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Seeds electronics reference data (brands, types, models) from
 * {@code classpath:seed/electronics.json}.
 *
 * <p>Uses an <b>upsert</b> strategy: existing rows are left untouched,
 * missing rows are created.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ElectronicDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "seed/electronics.json";

    private final ElectronicBrandRepository brandRepository;
    private final ElectronicTypeRepository typeRepository;
    private final ElectronicModelRepository modelRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "electronics";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            seedBrands(root.get("brands"));
            seedTypes(root.get("types"));
            seedModels(root.get("models"));
            backfillNullModelTypes();
            log.info("Electronics seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Electronics seed failed", e);
            return Result.error("Electronics seed failed: " + e.getMessage(), "SEED_FAILED");
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
        Optional<ElectronicBrand> existing = brandRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ElectronicBrand brand = existing.get();
            if (brand.getLabel() == null || brand.getLabel().isBlank()) {
                brand.setLabel(label);
                brandRepository.save(brand);
            }
            return;
        }
        ElectronicBrand brand = new ElectronicBrand();
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
        Optional<ElectronicType> existing = typeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ElectronicType type = existing.get();
            if (type.getLabel() == null || type.getLabel().isBlank()) {
                type.setLabel(label);
                typeRepository.save(type);
            }
            return;
        }
        ElectronicType type = new ElectronicType();
        type.setName(key);
        type.setLabel(label);
        typeRepository.save(type);
    }

    // ── Model Seeding ───────────────────────────────────────────────────

    private void seedModels(JsonNode modelsNode) {
        if (modelsNode == null || !modelsNode.isArray()) return;
        for (JsonNode entry : modelsNode) {
            String brandKey = entry.get("brand").asText();
            String typeKey = entry.get("type").asText();
            JsonNode names = entry.get("names");

            ElectronicBrand brand = getBrand(brandKey);
            ElectronicType type = getType(typeKey);
            if (brand == null || type == null || names == null) continue;

            for (JsonNode nameNode : names) {
                ensureModel(brand, type, nameNode.asText());
            }
        }
    }

    private void ensureModel(ElectronicBrand brand, ElectronicType type, String modelName) {
        if (brand == null || type == null || modelName == null || modelName.isBlank()) return;

        if (modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(
                brand.getId(), type.getId(), modelName).isEmpty()) {
            ElectronicModel created = new ElectronicModel();
            created.setBrand(brand);
            created.setType(type);
            created.setName(modelName);
            modelRepository.save(created);
        }

        // Backfill type for existing models that have null type
        List<ElectronicModel> existingModels = modelRepository.findAllByBrand_IdAndNameIgnoreCase(
                brand.getId(), modelName);
        for (ElectronicModel m : existingModels) {
            if (m.getType() == null) {
                m.setType(type);
                modelRepository.save(m);
            }
        }
    }

    // ── Backfill ────────────────────────────────────────────────────────

    private void backfillNullModelTypes() {
        ElectronicType mobilePhone = getType("MOBILE_PHONE");
        ElectronicType laptop = getType("LAPTOP");
        ElectronicType tablet = getType("TABLET");
        ElectronicType gameConsole = getType("GAME_CONSOLE");
        ElectronicType headphones = getType("HEADPHONES");
        ElectronicType other = getType("OTHER");

        List<ElectronicModel> nullTypedModels = modelRepository.findByTypeIsNull();
        for (ElectronicModel m : nullTypedModels) {
            String name = m.getName();
            if (name == null) {
                if (other != null) {
                    m.setType(other);
                    modelRepository.save(m);
                }
                continue;
            }
            String n = name.trim().toLowerCase(Locale.ROOT);
            ElectronicType inferred =
                    (mobilePhone != null && (n.startsWith("iphone") || n.startsWith("pixel") || n.contains("galaxy s") || n.contains("redmi") || n.contains("poco") || n.startsWith("xiaomi "))) ? mobilePhone :
                    (laptop != null && (n.startsWith("macbook") || n.contains("galaxy book") || n.contains("matebook") || n.contains("thinkpad") || n.contains("ideapad") || n.contains("inspiron") || n.contains("xps") || n.contains("pavilion") || n.contains("spectre") || n.contains("zenbook") || n.contains("vivobook") || n.contains("legion") || n.contains("rog") || n.contains("tuf"))) ? laptop :
                    (tablet != null && (n.startsWith("ipad") || n.contains("tab ") || n.contains("matepad") || n.contains("pad "))) ? tablet :
                    (gameConsole != null && (n.startsWith("playstation") || n.startsWith("xbox") || n.contains("nintendo"))) ? gameConsole :
                    (headphones != null && (n.contains("airpods") || n.contains("buds") || n.startsWith("wh-") || n.startsWith("wf-") || n.contains("freebuds"))) ? headphones :
                    other;

            if (inferred != null) {
                m.setType(inferred);
                modelRepository.save(m);
            }
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private ElectronicBrand getBrand(String name) {
        return name == null ? null : brandRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private ElectronicType getType(String name) {
        return name == null ? null : typeRepository.findByNameIgnoreCase(name).orElse(null);
    }
}
