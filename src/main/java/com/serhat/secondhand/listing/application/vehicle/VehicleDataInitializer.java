package com.serhat.secondhand.listing.application.vehicle;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.application.vehicle.dto.*;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class VehicleDataInitializer implements SeedTask {

    private static final String VEHICLES_BASE_PATH = "data/vehicles/";
    private static final String BRANDS_METADATA_PATH = VEHICLES_BASE_PATH + "brands.json";

    private final CarBrandRepository brandRepository;
    private final VehicleTypeRepository typeRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleGenerationRepository generationRepository;
    private final VehicleEngineRepository engineRepository;
    private final VehicleTrimRepository trimRepository;
    private final VehicleListingRepository vehicleListingRepository;
    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public String key() {
        return "vehicle";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        try {
            evictVehicleCaches();

            log.info("Loading vehicle catalog metadata from {}", BRANDS_METADATA_PATH);
            List<VehicleBrandCatalogDto> brandCatalogs = loadBrandsMetadata();

            Set<String> catalogBrandKeys = new HashSet<>();
            Set<String> catalogTypeKeys = new HashSet<>();

            for (VehicleBrandCatalogDto brandCatalog : brandCatalogs) {
                if (brandCatalog.getBrand() == null || brandCatalog.getBrand().isBlank()) {
                    throw new IllegalStateException("Brand code cannot be null or empty in brands.json");
                }
                catalogBrandKeys.add(normalizeKey(brandCatalog.getBrand()));

                if (brandCatalog.getSupportedTypes() != null) {
                    for (VehicleBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                        if (typeFile.getType() == null || typeFile.getType().isBlank()) {
                            throw new IllegalStateException(
                                    "Vehicle type cannot be null or empty in brands.json for brand: "
                                            + brandCatalog.getBrand());
                        }
                        catalogTypeKeys.add(normalizeKey(typeFile.getType()));
                    }
                }
            }

            pruneStaleTypes(catalogTypeKeys);

            log.info("Seeding brand labels and types...");
            for (VehicleBrandCatalogDto brandCatalog : brandCatalogs) {
                upsertBrand(brandCatalog.getBrand(), brandCatalog.getDisplayName());
                if (brandCatalog.getSupportedTypes() != null) {
                    for (VehicleBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                        upsertType(typeFile.getType(), formatTypeLabel(typeFile.getType()));
                    }
                }
            }
            for (String coreType : CORE_VEHICLE_TYPES) {
                upsertType(coreType, formatTypeLabel(coreType));
            }

            int dataFilesRead = 0;
            int totalModelsSeeded = 0;

            for (VehicleBrandCatalogDto brandCatalog : brandCatalogs) {
                if (brandCatalog.getSupportedTypes() == null) {
                    continue;
                }
                for (VehicleBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                    String relativePath = typeFile.getDataFile();
                    String fullPath = VEHICLES_BASE_PATH + relativePath;

                    log.info("Loading brand data file: {}", fullPath);
                    List<VehicleSeedModelDto> models = loadBrandModelsFile(fullPath);
                    dataFilesRead++;

                    int seededForFile = 0;
                    for (VehicleSeedModelDto modelDto : models) {
                        validateAndSeedModel(brandCatalog.getBrand(), typeFile.getType(), modelDto, fullPath);
                        seededForFile++;
                    }
                    totalModelsSeeded += seededForFile;
                    log.info("Seeded {} models from brand file: {}", seededForFile, fullPath);
                }
            }

            pruneStaleModelsAndBrands(catalogBrandKeys);
            evictVehicleCaches();
            log.info(
                    "Vehicle seed successfully completed: {} brands cataloged, {} data files read, {} total models seeded",
                    brandCatalogs.size(),
                    dataFilesRead,
                    totalModelsSeeded);

            return Result.success();
        } catch (Exception e) {
            log.error("Vehicle catalog seeding failed critically. Failing application startup.", e);
            throw new IllegalStateException("Vehicle catalog seed critical failure", e);
        }
    }

    private List<VehicleBrandCatalogDto> loadBrandsMetadata() throws Exception {
        ClassPathResource resource = new ClassPathResource(BRANDS_METADATA_PATH);
        if (!resource.exists()) {
            throw new FileNotFoundException("Brands metadata index file was not found under: " + BRANDS_METADATA_PATH);
        }
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, new TypeReference<List<VehicleBrandCatalogDto>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse catalog metadata index " + BRANDS_METADATA_PATH, e);
        }
    }

    private List<VehicleSeedModelDto> loadBrandModelsFile(String fullPath) throws Exception {
        ClassPathResource resource = new ClassPathResource(fullPath);
        if (!resource.exists()) {
            throw new FileNotFoundException("Brand-specific catalog data file was not found under: " + fullPath);
        }
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, new TypeReference<List<VehicleSeedModelDto>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse brand-specific catalog array " + fullPath, e);
        }
    }

    private UUID generateStableUuid(String key) {
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));
    }

    private void validateAndSeedModel(String parentBrand, String parentType, VehicleSeedModelDto modelDto,
            String sourceFile) {
        if (modelDto.getBrand() == null || !modelDto.getBrand().equalsIgnoreCase(parentBrand)) {
            throw new IllegalArgumentException(String.format(
                    "Inconsistent brand code in %s: Expected %s but found %s",
                    sourceFile, parentBrand, modelDto.getBrand()));
        }
        if (modelDto.getType() == null || !modelDto.getType().equalsIgnoreCase(parentType)) {
            throw new IllegalArgumentException(String.format(
                    "Inconsistent vehicle type in %s: Expected %s but found %s",
                    sourceFile, parentType, modelDto.getType()));
        }
        if (modelDto.getName() == null || modelDto.getName().isBlank()) {
            throw new IllegalArgumentException("Model name is missing in file: " + sourceFile);
        }

        String brandKey = normalizeKey(modelDto.getBrand());
        String typeKey = normalizeKey(modelDto.getType());
        CarBrand brand = brandRepository.findByNameIgnoreCase(brandKey)
                .orElseThrow(() -> new IllegalStateException("Brand not found in database: " + brandKey));
        VehicleType type = typeRepository.findByNameIgnoreCase(typeKey)
                .orElseThrow(() -> new IllegalStateException("Vehicle type not found in database: " + typeKey));

        String modelNaturalKey = "vehicle-model:" + brandKey + ":" + typeKey + ":" + normalizeKey(modelDto.getName());
        UUID modelId = generateStableUuid(modelNaturalKey);

        Optional<VehicleModel> existingModelOpt = modelRepository
                .findFirstByBrand_IdAndType_IdAndNameIgnoreCase(brand.getId(), type.getId(), modelDto.getName());
        VehicleModel model;

        if (existingModelOpt.isPresent()) {
            model = existingModelOpt.get();
            model.setNew(false);
        } else {
            model = new VehicleModel();
            model.setId(modelId);
            model.setBrand(brand);
            model.setType(type);
            model.setName(modelDto.getName());
        }

        if (modelDto.getSupportedBodyTypes() != null) {
            model.getSupportedBodyTypes().clear();
            for (String btStr : modelDto.getSupportedBodyTypes()) {
                try {
                    model.getSupportedBodyTypes().add(BodyType.valueOf(btStr.toUpperCase(Locale.ROOT)));
                } catch (Exception e) {
                    throw new IllegalArgumentException(String.format(
                            "Invalid body type '%s' in file: %s", btStr, sourceFile), e);
                }
            }
        }

        model = modelRepository.save(model);

        if (modelDto.getGenerations() != null) {
            for (VehicleGenerationDto genDto : modelDto.getGenerations()) {
                if (genDto.getName() == null || genDto.getName().isBlank()) {
                    throw new IllegalArgumentException(
                            "Generation name cannot be null or empty under model: " + modelDto.getName());
                }

                String genNaturalKey = "vehicle-generation:" + brandKey + ":" + typeKey + ":"
                        + normalizeKey(modelDto.getName()) + ":" + normalizeKey(genDto.getName());
                UUID genId = generateStableUuid(genNaturalKey);

                Optional<VehicleGeneration> existingGenOpt = generationRepository
                        .findByModel_IdAndNameIgnoreCase(model.getId(), genDto.getName());
                VehicleGeneration generation;

                if (existingGenOpt.isPresent()) {
                    generation = existingGenOpt.get();
                    generation.setNew(false);
                } else {
                    generation = new VehicleGeneration();
                    generation.setId(genId);
                    generation.setName(genDto.getName());
                    generation.setModel(model);
                }

                Integer startYear = genDto.getStartYear();
                Integer endYear = genDto.getEndYear();
                if (startYear == null) {
                    int[] parsedYears = parseYearsFromName(genDto.getName());
                    if (parsedYears != null) {
                        startYear = parsedYears[0];
                        endYear = parsedYears[1] != -1 ? parsedYears[1] : null;
                    }
                }
                generation.setStartYear(startYear);
                generation.setEndYear(endYear);
                generation = generationRepository.save(generation);

                if (genDto.getEngines() != null) {
                    for (VehicleEngineDto engDto : genDto.getEngines()) {
                        if (engDto.getName() == null || engDto.getName().isBlank()) {
                            throw new IllegalArgumentException(
                                    "Engine name cannot be empty under generation: " + genDto.getName());
                        }

                        String engNaturalKey = "vehicle-engine:" + brandKey + ":" + typeKey + ":"
                                + normalizeKey(modelDto.getName()) + ":" + normalizeKey(genDto.getName()) + ":"
                                + normalizeKey(engDto.getName()) + ":" + normalizeKey(engDto.getFuelType());
                        UUID engId = generateStableUuid(engNaturalKey);

                        Optional<VehicleEngine> existingEngOpt = engineRepository
                                .findByGeneration_IdAndNameIgnoreCase(generation.getId(), engDto.getName());
                        VehicleEngine engine;

                        if (existingEngOpt.isPresent()) {
                            engine = existingEngOpt.get();
                            engine.setNew(false);
                        } else {
                            engine = new VehicleEngine();
                            engine.setId(engId);
                            engine.setName(engDto.getName());
                            engine.setGeneration(generation);
                        }

                        if (engDto.getFuelType() == null || engDto.getFuelType().isBlank()) {
                            throw new IllegalArgumentException(
                                    "Fuel type cannot be empty under engine: " + engDto.getName());
                        }

                        try {
                            engine.setFuelType(FuelType.valueOf(engDto.getFuelType().toUpperCase(Locale.ROOT)));
                        } catch (Exception e) {
                            throw new IllegalArgumentException(String.format(
                                    "Invalid fuel type '%s' for engine '%s' in file %s",
                                    engDto.getFuelType(), engDto.getName(), sourceFile), e);
                        }

                        Integer hp = engDto.getHorsePower();
                        Integer capacity = engDto.getEngineCapacity();
                        if (hp == null || capacity == null) {
                            int[] parsedSpecs = parseEngineSpecsFromName(engDto.getName());
                            if (parsedSpecs != null) {
                                if (hp == null && parsedSpecs[0] != -1) {
                                    hp = parsedSpecs[0];
                                }
                                if (capacity == null && parsedSpecs[1] != -1) {
                                    capacity = parsedSpecs[1];
                                }
                            }
                        }
                        engine.setHorsePower(hp);
                        engine.setEngineCapacity(capacity);
                        engineRepository.save(engine);
                    }
                }

                if (genDto.getTrims() != null) {
                    for (String trimName : genDto.getTrims()) {
                        if (trimName == null || trimName.isBlank()) {
                            continue;
                        }
                        String trimNaturalKey = "vehicle-trim:" + brandKey + ":" + typeKey + ":"
                                + normalizeKey(modelDto.getName()) + ":" + normalizeKey(genDto.getName()) + ":"
                                + normalizeKey(trimName);
                        UUID trimId = generateStableUuid(trimNaturalKey);

                        Optional<VehicleTrim> existingTrimOpt = trimRepository
                                .findByGeneration_IdAndNameIgnoreCase(generation.getId(), trimName);
                        if (existingTrimOpt.isPresent()) {
                            VehicleTrim trim = existingTrimOpt.get();
                            trim.setNew(false);
                            trimRepository.save(trim);
                        } else {
                            VehicleTrim trim = new VehicleTrim();
                            trim.setId(trimId);
                            trim.setName(trimName);
                            trim.setGeneration(generation);
                            trimRepository.save(trim);
                        }
                    }
                }
            }
        }
    }

    /**
     * Removes models that no longer belong to the catalog (brand dropped from brands.json, or an orphan
     * without brand/type) together with their generations, engines and trims, and then the brands left
     * without models. Anything a listing points at is kept.
     */
    private void pruneStaleModelsAndBrands(Set<String> catalogBrandKeys) {
        Object[] keys = catalogBrandKeys.stream().map(k -> k.toUpperCase(java.util.Locale.ROOT)).toArray();
        String in = String.join(",", java.util.Collections.nCopies(keys.length, "?"));
        String staleModels = "SELECT m.id FROM vehicle_models m LEFT JOIN car_brands b ON b.id = m.car_brand_id"
                + " WHERE (m.car_brand_id IS NULL OR m.vehicle_type_id IS NULL OR UPPER(b.name) NOT IN (" + in + "))"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v WHERE v.vehicle_model_id = m.id)"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v JOIN vehicle_generations g ON g.id = v.vehicle_generation_id"
                + "                 WHERE g.vehicle_model_id = m.id)";
        String staleGenerations = "SELECT id FROM vehicle_generations WHERE vehicle_model_id IN (" + staleModels + ")";

        jdbcTemplate.update("DELETE FROM vehicle_engines WHERE vehicle_generation_id IN (" + staleGenerations + ")", keys);
        jdbcTemplate.update("DELETE FROM vehicle_trims WHERE vehicle_generation_id IN (" + staleGenerations + ")", keys);
        jdbcTemplate.update("DELETE FROM vehicle_model_body_types WHERE vehicle_model_id IN (" + staleModels + ")", keys);
        jdbcTemplate.update("DELETE FROM vehicle_generations WHERE vehicle_model_id IN (" + staleModels + ")", keys);
        int models = jdbcTemplate.update("DELETE FROM vehicle_models WHERE id IN (" + staleModels + ")", keys);
        int brands = jdbcTemplate.update("DELETE FROM car_brands b WHERE UPPER(b.name) NOT IN (" + in + ")"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_models m WHERE m.car_brand_id = b.id)"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v WHERE v.car_brand_id = b.id)", keys);
        log.info("Pruned {} stale vehicle model(s) and {} stale brand(s)", models, brands);
    }

    private static final Set<String> CORE_VEHICLE_TYPES = Set.of(
            "CAR", "COMMERCIAL", "MOTORCYCLE", "TRUCK", "VAN", "BICYCLE"
    );

    public String formatTypeLabel(String key) {
        if (key == null) return "";
        String upper = key.trim().toUpperCase(Locale.ROOT);
        return switch (upper) {
            case "CAR" -> "Otomobil";
            case "COMMERCIAL" -> "Ticari Araçlar";
            case "MOTORCYCLE" -> "Motosiklet";
            case "TRUCK" -> "Kamyon / Çekici";
            case "VAN" -> "Minibüs / Panelvan";
            case "BICYCLE" -> "Bisiklet";
            default -> {
                String[] parts = upper.toLowerCase(Locale.ROOT).split("_");
                StringBuilder sb = new StringBuilder();
                for (String part : parts) {
                    if (!part.isEmpty()) {
                        sb.append(Character.toUpperCase(part.charAt(0)))
                                .append(part.substring(1))
                                .append(" ");
                    }
                }
                yield sb.toString().trim();
            }
        };
    }

    private void pruneStaleTypes(Set<String> catalogTypeKeys) {
        Set<String> keepKeys = new HashSet<>(catalogTypeKeys);
        keepKeys.addAll(CORE_VEHICLE_TYPES);
        typeRepository.findAll().stream()
                .filter(t -> !keepKeys.contains(normalizeKey(t.getName())))
                .forEach(t -> {
                    typeRepository.delete(t);
                    log.debug("Removed stale vehicle type: {}", t.getName());
                });
    }

    private void upsertBrand(String key, String label) {
        String normalizedKey = normalizeKey(key);
        Optional<CarBrand> existing = brandRepository.findByNameIgnoreCase(normalizedKey);
        CarBrand brand;
        if (existing.isPresent()) {
            brand = existing.get();
            brand.setNew(false);
        } else {
            brand = new CarBrand();
            brand.setId(generateStableUuid("vehicle-brand:" + normalizedKey));
            brand.setName(normalizedKey);
        }
        brand.setLabel(label);
        brandRepository.save(brand);
    }

    private void upsertType(String key, String label) {
        String normalizedKey = normalizeKey(key);
        Optional<VehicleType> existing = typeRepository.findByNameIgnoreCase(normalizedKey);
        VehicleType type;
        if (existing.isPresent()) {
            type = existing.get();
            type.setNew(false);
        } else {
            type = new VehicleType();
            type.setId(generateStableUuid("vehicle-type:" + normalizedKey));
            type.setName(normalizedKey);
        }
        type.setLabel(label);
        typeRepository.save(type);
    }

    private void evictVehicleCaches() {
        Optional.ofNullable(cacheManager.getCache("catalog:brands")).ifPresent(cache -> cache.clear());
        Optional.ofNullable(cacheManager.getCache("catalog:vehicleTypes")).ifPresent(cache -> cache.clear());
    }

    public static int[] parseYearsFromName(String name) {
        if (name == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                "\\b(19\\d\\d|20\\d\\d)\\s*[-–—]\\s*(19\\d\\d|20\\d\\d)?").matcher(name);
        if (m.find()) {
            int start = Integer.parseInt(m.group(1));
            Integer end = (m.group(2) != null && !m.group(2).isBlank()) ? Integer.parseInt(m.group(2)) : null;
            return new int[]{start, end != null ? end : -1};
        }
        return null;
    }

    public static int[] parseEngineSpecsFromName(String name) {
        if (name == null) return null;
        int hp = -1;
        int capacity = -1;

        java.util.regex.Matcher hpMatcher = java.util.regex.Pattern.compile(
                "\\b(\\d{2,4})\\s*(?:hp|bg|ps|bhp)\\b", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(name);
        if (hpMatcher.find()) {
            hp = Integer.parseInt(hpMatcher.group(1));
        }

        java.util.regex.Matcher ccMatcher = java.util.regex.Pattern.compile(
                "\\b(\\d{2,4})\\s*cc\\b", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(name);
        if (ccMatcher.find()) {
            capacity = Integer.parseInt(ccMatcher.group(1));
        } else {
            java.util.regex.Matcher literMatcher = java.util.regex.Pattern.compile(
                    "\\b([1-6]\\.[0-9])\\b").matcher(name);
            if (literMatcher.find()) {
                double liters = Double.parseDouble(literMatcher.group(1));
                capacity = (int) Math.round(liters * 1000);
            }
        }

        if (hp == -1) {
            java.util.regex.Matcher trailingHp = java.util.regex.Pattern.compile(
                    "(?:TDI|TSI|TFSI|CDTI|dCi|EcoBoost|D-4D|BlueHDi|PureTech|VTEC|CRDi|T-GDI|TwinPower)\\s+(\\d{2,3})\\b").matcher(name);
            if (trailingHp.find()) {
                hp = Integer.parseInt(trailingHp.group(1));
            }
        }

        return new int[]{hp, capacity};
    }

    private static String normalizeKey(String key) {
        return key == null ? "" : key.trim().toUpperCase(Locale.ROOT);
    }
}
