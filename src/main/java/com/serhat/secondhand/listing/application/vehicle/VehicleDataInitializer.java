package com.serhat.secondhand.listing.application.vehicle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Seeds vehicle reference data from {@code classpath:seed/vehicle.json}.
 *
 * <p>Replaces the legacy flat model catalog with brand → type → model → generation → engine/trim.
 * Stale rows not present in the JSON file are removed on each run.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VehicleDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "seed/vehicle.json";

    private final CarBrandRepository brandRepository;
    private final VehicleTypeRepository typeRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleGenerationRepository generationRepository;
    private final VehicleEngineRepository engineRepository;
    private final VehicleTrimRepository trimRepository;
    private final VehicleListingRepository vehicleListingRepository;
    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;

    @Override
    public String key() {
        return "vehicle";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        try {
            // Stale Redis entries may hold Hibernate proxies — clear before any @Cacheable lookup
            evictVehicleCaches();

            JsonNode root = loadCatalog();
            Set<String> catalogBrandKeys = collectKeys(root.get("brands"));
            Set<String> catalogTypeKeys = collectKeys(root.get("types"));

            purgeVehicleHierarchy();
            pruneStaleBrands(catalogBrandKeys);
            pruneStaleTypes(catalogTypeKeys);

            seedBrands(root.get("brands"));
            seedTypes(root.get("types"));
            int modelCount = seedModels(root.get("models"));

            evictVehicleCaches();
            log.info(
                    "Vehicle seed completed: {} brands, {} types, {} models (catalog)",
                    catalogBrandKeys.size(),
                    catalogTypeKeys.size(),
                    modelCount);
            return Result.success();
        } catch (Exception e) {
            log.error("Vehicle seed failed", e);
            return Result.error("Vehicle seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private Set<String> collectKeys(JsonNode arrayNode) {
        Set<String> keys = new HashSet<>();
        if (arrayNode == null || !arrayNode.isArray()) {
            return keys;
        }
        for (JsonNode node : arrayNode) {
            keys.add(normalizeKey(node.get("key").asText()));
        }
        return keys;
    }

    private void purgeVehicleHierarchy() {
        int detached = vehicleListingRepository.detachCatalogReferences();
        if (detached > 0) {
            log.info("Detached vehicle catalog references from {} listing(s)", detached);
        }
        trimRepository.deleteAll();
        engineRepository.deleteAll();
        generationRepository.deleteAll();
        modelRepository.deleteAll();
        log.info("Cleared vehicle models, generations, engines and trims");
    }

    private void pruneStaleBrands(Set<String> catalogBrandKeys) {
        brandRepository.findAll().stream()
                .filter(b -> !catalogBrandKeys.contains(normalizeKey(b.getName())))
                .forEach(b -> {
                    brandRepository.delete(b);
                    log.debug("Removed stale car brand: {}", b.getName());
                });
    }

    private void pruneStaleTypes(Set<String> catalogTypeKeys) {
        typeRepository.findAll().stream()
                .filter(t -> !catalogTypeKeys.contains(normalizeKey(t.getName())))
                .forEach(t -> {
                    typeRepository.delete(t);
                    log.debug("Removed stale vehicle type: {}", t.getName());
                });
    }

    private void seedBrands(JsonNode brandsNode) {
        if (brandsNode == null || !brandsNode.isArray()) {
            return;
        }
        for (JsonNode node : brandsNode) {
            upsertBrand(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertBrand(String key, String label) {
        String normalizedKey = normalizeKey(key);
        CarBrand brand = brandRepository.findByNameIgnoreCase(normalizedKey)
                .orElseGet(() -> {
                    CarBrand created = new CarBrand();
                    created.setName(normalizedKey);
                    return created;
                });
        brand.setLabel(label);
        brandRepository.save(brand);
    }

    private void seedTypes(JsonNode typesNode) {
        if (typesNode == null || !typesNode.isArray()) {
            return;
        }
        for (JsonNode node : typesNode) {
            upsertType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertType(String key, String label) {
        String normalizedKey = normalizeKey(key);
        VehicleType type = typeRepository.findByNameIgnoreCase(normalizedKey)
                .orElseGet(() -> {
                    VehicleType created = new VehicleType();
                    created.setName(normalizedKey);
                    return created;
                });
        type.setLabel(label);
        typeRepository.save(type);
    }

    private int seedModels(JsonNode modelsNode) {
        if (modelsNode == null || !modelsNode.isArray()) {
            return 0;
        }
        int count = 0;
        for (JsonNode entry : modelsNode) {
            if (seedModel(entry)) {
                count++;
            }
        }
        return count;
    }

    private boolean seedModel(JsonNode entry) {
        String brandKey = normalizeKey(entry.get("brand").asText());
        String typeKey = normalizeKey(entry.get("type").asText());
        String name = entry.get("name").asText();

        CarBrand brand = brandRepository.findByNameIgnoreCase(brandKey).orElse(null);
        VehicleType type = typeRepository.findByNameIgnoreCase(typeKey).orElse(null);
        if (brand == null || type == null || name == null || name.isBlank()) {
            log.warn("Skipping model seed — missing brand={}, type={}, name={}", brandKey, typeKey, name);
            return false;
        }

        VehicleModel model = new VehicleModel();
        model.setBrand(brand);
        model.setType(type);
        model.setName(name);

        if (entry.has("supportedBodyTypes") && entry.get("supportedBodyTypes").isArray()) {
            for (JsonNode btNode : entry.get("supportedBodyTypes")) {
                try {
                    model.getSupportedBodyTypes().add(BodyType.valueOf(btNode.asText().toUpperCase(Locale.ROOT)));
                } catch (Exception e) {
                    log.warn("Invalid BodyType in seed: {}", btNode.asText());
                }
            }
        }
        model = modelRepository.save(model);

        if (entry.has("generations") && entry.get("generations").isArray()) {
            for (JsonNode genNode : entry.get("generations")) {
                seedGeneration(genNode, model);
            }
        }
        return true;
    }

    private void seedGeneration(JsonNode genNode, VehicleModel model) {
        String genName = genNode.get("name").asText();
        VehicleGeneration generation = new VehicleGeneration();
        generation.setName(genName);
        generation.setModel(model);
        generation = generationRepository.save(generation);

        if (genNode.has("engines") && genNode.get("engines").isArray()) {
            for (JsonNode engNode : genNode.get("engines")) {
                VehicleEngine engine = new VehicleEngine();
                engine.setName(engNode.get("name").asText());
                engine.setGeneration(generation);
                String fuelTypeStr = engNode.get("fuelType").asText();
                try {
                    engine.setFuelType(FuelType.valueOf(fuelTypeStr.toUpperCase(Locale.ROOT)));
                } catch (Exception e) {
                    log.warn("Invalid FuelType in seed: {}", fuelTypeStr);
                }
                engineRepository.save(engine);
            }
        }

        if (genNode.has("trims") && genNode.get("trims").isArray()) {
            for (JsonNode trimNode : genNode.get("trims")) {
                VehicleTrim trim = new VehicleTrim();
                trim.setName(trimNode.asText());
                trim.setGeneration(generation);
                trimRepository.save(trim);
            }
        }
    }

    private void evictVehicleCaches() {
        Optional.ofNullable(cacheManager.getCache("brands")).ifPresent(cache -> cache.clear());
        Optional.ofNullable(cacheManager.getCache("vehicleTypes")).ifPresent(cache -> cache.clear());
    }

    private static String normalizeKey(String key) {
        return key == null ? "" : key.trim().toUpperCase(Locale.ROOT);
    }
}
