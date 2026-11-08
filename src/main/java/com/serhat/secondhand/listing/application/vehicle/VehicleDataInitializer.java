package com.serhat.secondhand.listing.application.vehicle;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.core.seed.SeedKeyNormalizer;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.application.vehicle.dto.*;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
import com.serhat.secondhand.listing.validation.vehicle.VehicleSpecFields;
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
    private static final String TYPES_PATH = VEHICLES_BASE_PATH + "types.json";

    private final CarBrandRepository brandRepository;
    private final VehicleTypeRepository typeRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleGenerationRepository generationRepository;
    private final VehicleEngineRepository engineRepository;
    private final VehicleTrimRepository trimRepository;
    private final VehicleVersionRepository versionRepository;
    private final VehicleListingRepository vehicleListingRepository;
    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final CatalogLegacyPruner legacyPruner;

    /** Brand and type rows by key, loaded once per run instead of once per model. */
    private final Map<String, CarBrand> brandsByKey = new HashMap<>();
    private final Map<String, VehicleType> typesByKey = new HashMap<>();

    @Override
    public String key() {
        return "vehicle";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        try {
            evictVehicleCaches();
            brandsByKey.clear();
            typesByKey.clear();

            Map<String, VehicleTypeDefinitionDto> typeDefinitions = loadTypeDefinitions();

            log.info("Loading vehicle catalog metadata from {}", BRANDS_METADATA_PATH);
            List<VehicleBrandCatalogDto> brandCatalogs = loadBrandsMetadata();

            Set<String> catalogBrandKeys = new HashSet<>();

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
                        if (!typeDefinitions.containsKey(normalizeKey(typeFile.getType()))) {
                            throw new IllegalStateException("brands.json brand " + brandCatalog.getBrand()
                                    + " uses vehicle type " + typeFile.getType() + " which " + TYPES_PATH
                                    + " does not define");
                        }
                    }
                }
            }

            if (catalogBrandKeys.isEmpty()) {
                throw new IllegalStateException("brands.json lists no brands; refusing to prune the vehicle catalog");
            }
            log.info("Seeding vehicle types and brand labels...");
            for (VehicleTypeDefinitionDto definition : typeDefinitions.values()) {
                upsertType(definition);
            }
            for (VehicleBrandCatalogDto brandCatalog : brandCatalogs) {
                upsertBrand(brandCatalog.getBrand(), brandCatalog.getDisplayName());
            }
            Set<UUID> seededModelIds = new HashSet<>();

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
                        seededModelIds.add(validateAndSeedModel(brandCatalog.getBrand(), typeFile.getType(), modelDto, fullPath));
                        seededForFile++;
                    }
                    totalModelsSeeded += seededForFile;
                    log.info("Seeded {} models from brand file: {}", seededForFile, fullPath);
                }
            }

            relinkListingsOfUnseededModels(seededModelIds);
            pruneStaleModelsAndBrands(catalogBrandKeys, seededModelIds);
            pruneStaleTypes(typeDefinitions.keySet());
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

    /** Reads and checks data/vehicles/types.json; keyed by normalized type name, in file order. */
    private Map<String, VehicleTypeDefinitionDto> loadTypeDefinitions() {
        ClassPathResource resource = new ClassPathResource(TYPES_PATH);
        if (!resource.exists()) {
            throw new IllegalStateException("Vehicle type definitions were not found under: " + TYPES_PATH);
        }
        List<VehicleTypeDefinitionDto> definitions;
        try (InputStream is = resource.getInputStream()) {
            definitions = objectMapper.readValue(is, new TypeReference<List<VehicleTypeDefinitionDto>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse vehicle type definitions " + TYPES_PATH, e);
        }
        if (definitions == null || definitions.isEmpty()) {
            throw new IllegalStateException(TYPES_PATH + " defines no vehicle types; refusing to prune them");
        }
        Map<String, VehicleTypeDefinitionDto> byKey = new LinkedHashMap<>();
        for (VehicleTypeDefinitionDto definition : definitions) {
            if (definition.getType() == null || definition.getType().isBlank()
                    || definition.getLabel() == null || definition.getLabel().isBlank()) {
                throw new IllegalStateException(TYPES_PATH + ": every type needs a type and a label");
            }
            String key = normalizeKey(definition.getType());
            if (byKey.put(key, definition) != null) {
                throw new IllegalStateException(TYPES_PATH + ": vehicle type " + key + " is defined twice");
            }
            if (definition.getBodyTypes() == null || definition.getBodyTypes().isEmpty()) {
                throw new IllegalStateException(TYPES_PATH + ": vehicle type " + key + " lists no bodyTypes");
            }
            for (String bodyType : definition.getBodyTypes()) {
                parseOptionalEnum(BodyType.class, bodyType, "bodyTypes", TYPES_PATH);
            }
            Map<String, String> fields = definition.getFields() == null ? Map.of() : definition.getFields();
            Set<String> unknown = new TreeSet<>(fields.keySet());
            unknown.removeAll(VehicleSpecFields.ALL.keySet());
            Set<String> missing = new TreeSet<>(VehicleSpecFields.ALL.keySet());
            missing.removeAll(fields.keySet());
            if (!unknown.isEmpty() || !missing.isEmpty()) {
                throw new IllegalStateException(TYPES_PATH + ": vehicle type " + key + " fields must name exactly "
                        + VehicleSpecFields.ALL.keySet() + " (unknown: " + unknown + ", missing: " + missing + ")");
            }
            fields.values().forEach(rule -> parseOptionalEnum(VehicleFieldRule.class, rule, "fields", TYPES_PATH));
        }
        return byKey;
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

    private UUID validateAndSeedModel(String parentBrand, String parentType, VehicleSeedModelDto modelDto,
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
        CarBrand brand = brandsByKey.get(brandKey);
        if (brand == null) {
            throw new IllegalStateException("Brand not found in database: " + brandKey);
        }
        VehicleType type = typesByKey.get(typeKey);
        if (type == null) {
            throw new IllegalStateException("Vehicle type not found in database: " + typeKey);
        }

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
                BodyType bodyType;
                try {
                    bodyType = BodyType.valueOf(btStr.toUpperCase(Locale.ROOT));
                } catch (Exception e) {
                    throw new IllegalArgumentException(String.format(
                            "Invalid body type '%s' in file: %s", btStr, sourceFile), e);
                }
                requireBodyTypeOfType(type, bodyType, modelDto.getName(), sourceFile);
                model.getSupportedBodyTypes().add(bodyType);
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
                generation.setBodyType(parseOptionalEnum(BodyType.class, genDto.getBodyType(), "bodyType", sourceFile));
                if (generation.getBodyType() != null) {
                    requireBodyTypeOfType(type, generation.getBodyType(), modelDto.getName() + " / " + genDto.getName(), sourceFile);
                }
                generation.setDoors(parseOptionalEnum(Doors.class, genDto.getDoors(), "doors", sourceFile));
                generation.setSeatCount(parseOptionalEnum(SeatCount.class, genDto.getSeatCount(), "seatCount", sourceFile));
                generation.setFacelift(Boolean.TRUE.equals(genDto.getFacelift()));
                generation = generationRepository.save(generation);

                String genKeyPrefix = brandKey + ":" + typeKey + ":" + normalizeKey(modelDto.getName()) + ":"
                        + normalizeKey(genDto.getName());

                Map<String, VehicleTrim> trimsByName = new HashMap<>();
                if (genDto.getTrims() != null) {
                    for (String trimName : genDto.getTrims()) {
                        if (trimName == null || trimName.isBlank()) {
                            continue;
                        }
                        UUID trimId = generateStableUuid("vehicle-trim:" + genKeyPrefix + ":" + normalizeKey(trimName));
                        Optional<VehicleTrim> existingTrimOpt = trimRepository
                                .findByGeneration_IdAndNameIgnoreCase(generation.getId(), trimName);
                        VehicleTrim trim;
                        if (existingTrimOpt.isPresent()) {
                            trim = existingTrimOpt.get();
                            trim.setNew(false);
                        } else {
                            trim = new VehicleTrim();
                            trim.setId(trimId);
                            trim.setName(trimName);
                            trim.setGeneration(generation);
                        }
                        trimsByName.put(normalizeKey(trimName), trimRepository.save(trim));
                    }
                }

                boolean hasEngines = genDto.getEngines() != null && !genDto.getEngines().isEmpty();
                boolean hasVersions = genDto.getVersions() != null && !genDto.getVersions().isEmpty();
                if (hasEngines && hasVersions) {
                    throw new IllegalArgumentException(String.format(
                            "Generation '%s' in %s lists both engines and versions; use versions only",
                            genDto.getName(), sourceFile));
                }

                Set<UUID> seededVersionIds = new HashSet<>();
                if (hasEngines) {
                    for (VehicleEngineDto engDto : genDto.getEngines()) {
                        VehicleVersionDto asVersion = new VehicleVersionDto();
                        asVersion.setName(engDto.getName());
                        asVersion.setFuelType(engDto.getFuelType());
                        asVersion.setHorsePower(engDto.getHorsePower());
                        asVersion.setEngineCapacity(engDto.getEngineCapacity());
                        seedVersion(generation, genKeyPrefix, asVersion, trimsByName, seededVersionIds, sourceFile);
                    }
                }
                if (hasVersions) {
                    for (VehicleVersionDto versionDto : genDto.getVersions()) {
                        seedVersion(generation, genKeyPrefix, versionDto, trimsByName, seededVersionIds, sourceFile);
                    }
                }
                pruneStaleVersions(generation.getId(), seededVersionIds);
            }
        }
        return model.getId();
    }

    private static void requireBodyTypeOfType(VehicleType type, BodyType bodyType, String where, String sourceFile) {
        if (!type.getBodyTypes().contains(bodyType)) {
            throw new IllegalArgumentException(String.format(
                    "Body type %s of %s in %s is not allowed for vehicle type %s (types.json bodyTypes: %s)",
                    bodyType, where, sourceFile, type.getName(), type.getBodyTypes()));
        }
    }

    /**
     * Upserts one version and the legacy engine row with the same id (the current form still sends
     * engine ids). Ids come from model + generation + name + fuel, as engines always did.
     */
    private void seedVersion(VehicleGeneration generation, String genKeyPrefix, VehicleVersionDto dto,
                             Map<String, VehicleTrim> trimsByName, Set<UUID> seededVersionIds, String sourceFile) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Version name cannot be empty under generation: " + generation.getName());
        }
        if (dto.getFuelType() == null || dto.getFuelType().isBlank()) {
            throw new IllegalArgumentException("Fuel type cannot be empty under version: " + dto.getName());
        }
        FuelType fuelType = parseOptionalEnum(FuelType.class, dto.getFuelType(), "fuelType", sourceFile);
        UUID id = generateStableUuid("vehicle-engine:" + genKeyPrefix + ":" + normalizeKey(dto.getName()) + ":"
                + normalizeKey(dto.getFuelType()));

        Integer hp = dto.getHorsePower();
        Integer capacity = dto.getEngineCapacity();
        if (hp == null || capacity == null) {
            int[] parsedSpecs = parseEngineSpecsFromName(dto.getName());
            if (parsedSpecs != null) {
                if (hp == null && parsedSpecs[0] != -1) hp = parsedSpecs[0];
                if (capacity == null && parsedSpecs[1] != -1) capacity = parsedSpecs[1];
            }
        }

        // Legacy engine row: same id, matched by id first, then by name + fuel (older rows).
        UUID generationId = generation.getId();
        VehicleEngine engine = engineRepository.findById(id)
                .or(() -> engineRepository.findFirstByGeneration_IdAndNameIgnoreCaseAndFuelType(
                        generationId, dto.getName(), fuelType))
                .map(e -> { e.setNew(false); return e; })
                .orElseGet(() -> {
                    VehicleEngine e = new VehicleEngine();
                    e.setId(id);
                    e.setName(dto.getName());
                    e.setGeneration(generation);
                    return e;
                });
        engine.setFuelType(fuelType);
        engine.setHorsePower(hp);
        engine.setEngineCapacity(capacity);
        engine = engineRepository.save(engine);

        // The version always shares the engine's id (older engine rows may predate the derived id).
        UUID versionId = engine.getId();
        if (!seededVersionIds.add(versionId)) {
            throw new IllegalArgumentException(String.format(
                    "Duplicate version '%s' (%s) under generation '%s' in %s",
                    dto.getName(), dto.getFuelType(), generation.getName(), sourceFile));
        }
        VehicleVersion version = versionRepository.findById(versionId).orElseGet(() -> {
            VehicleVersion v = new VehicleVersion();
            v.setId(versionId);
            return v;
        });
        version.setGeneration(generation);
        version.setName(dto.getName());
        version.setFuelType(fuelType);
        version.setEngineCapacity(capacity);
        version.setHorsePower(hp);
        version.setPowerKw(dto.getPowerKw() != null ? dto.getPowerKw()
                : (hp != null ? (int) Math.round(hp * 0.7355) : null));
        version.setTorqueNm(dto.getTorqueNm());
        version.setGearbox(parseOptionalEnum(GearType.class, dto.getGearbox(), "gearbox", sourceFile));
        version.setGearCount(dto.getGearCount());
        version.setDrivetrain(parseOptionalEnum(Drivetrain.class, dto.getDrivetrain(), "drivetrain", sourceFile));
        version.setStartYear(dto.getStartYear());
        version.setEndYear(dto.getEndYear());
        version.setListPriceTry(dto.getListPriceTry());
        String source = dto.getSource() == null ? "claude-draft" : dto.getSource();
        if (!source.equals("claude-draft") && !source.equals("verified")) {
            throw new IllegalArgumentException("Unknown source '" + source + "' for version " + dto.getName() + " in " + sourceFile);
        }
        version.setSource(source);
        version.setSpecs(dto.getSpecs() != null ? new LinkedHashMap<>(dto.getSpecs()) : new LinkedHashMap<>());

        version.getTrims().clear();
        if (dto.getTrims() != null) {
            for (String trimName : dto.getTrims()) {
                VehicleTrim trim = trimsByName.get(normalizeKey(trimName));
                if (trim == null) {
                    throw new IllegalArgumentException(String.format(
                            "Version '%s' in %s names trim '%s', which generation '%s' does not list",
                            dto.getName(), sourceFile, trimName, generation.getName()));
                }
                version.getTrims().add(trim);
            }
        }
        versionRepository.save(version);
    }

    /**
     * Versions of a seeded generation that left the file are removed unless a listing points at them, and so
     * are their same-id legacy engine rows: a renamed version or a changed fuel type gets a new id, and the old
     * engine would otherwise stay in the form's engine list next to the new one.
     */
    private void pruneStaleVersions(UUID generationId, Set<UUID> keepIds) {
        List<UUID> stale = jdbcTemplate.queryForList(
                        "SELECT id FROM vehicle_versions vv WHERE vv.vehicle_generation_id = ?"
                                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v WHERE v.vehicle_version_id = vv.id)",
                        UUID.class, generationId).stream()
                .filter(id -> !keepIds.contains(id))
                .toList();
        if (!stale.isEmpty()) {
            versionRepository.deleteAllByIdInBatch(stale);
        }
        List<UUID> staleEngines = jdbcTemplate.queryForList(
                        "SELECT id FROM vehicle_engines ve WHERE ve.vehicle_generation_id = ?"
                                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v"
                                + " WHERE v.vehicle_engine_id = ve.id OR v.vehicle_version_id = ve.id)",
                        UUID.class, generationId).stream()
                .filter(id -> !keepIds.contains(id))
                .toList();
        if (!staleEngines.isEmpty()) {
            engineRepository.deleteAllByIdInBatch(staleEngines);
        }
    }

    private static <E extends Enum<E>> E parseOptionalEnum(Class<E> type, String raw, String field, String sourceFile) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(String.format("Invalid %s '%s' in file %s", field, raw, sourceFile), e);
        }
    }

    /**
     * Removes models this run did not seed (gone from their data file, or their brand/type gone from
     * brands.json) together with their generations, engines and trims, and then the brands left without
     * models. Anything a listing points at is kept.
     */
    private void pruneStaleModelsAndBrands(Set<String> catalogBrandKeys, Set<UUID> seededModelIds) {
        Object[] keys = catalogBrandKeys.stream().map(k -> k.toUpperCase(java.util.Locale.ROOT)).toArray();
        String in = String.join(",", java.util.Collections.nCopies(keys.length, "?"));
        String seeded = toUuidArrayLiteral(seededModelIds);
        String staleModels = "SELECT m.id FROM vehicle_models m"
                + " WHERE NOT (m.id = ANY('" + seeded + "'::uuid[]))"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v WHERE v.vehicle_model_id = m.id)"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v JOIN vehicle_generations g ON g.id = v.vehicle_generation_id"
                + "                 WHERE g.vehicle_model_id = m.id)";
        String staleGenerations = "SELECT id FROM vehicle_generations WHERE vehicle_model_id IN (" + staleModels + ")";

        jdbcTemplate.update("DELETE FROM vehicle_engines WHERE vehicle_generation_id IN (" + staleGenerations + ")");
        jdbcTemplate.update("DELETE FROM vehicle_trims WHERE vehicle_generation_id IN (" + staleGenerations + ")");
        jdbcTemplate.update("DELETE FROM vehicle_model_body_types WHERE vehicle_model_id IN (" + staleModels + ")");
        jdbcTemplate.update("DELETE FROM vehicle_generations WHERE vehicle_model_id IN (" + staleModels + ")");
        int models = jdbcTemplate.update("DELETE FROM vehicle_models WHERE id IN (" + staleModels + ")");
        int brands = jdbcTemplate.update("DELETE FROM car_brands b WHERE UPPER(b.name) NOT IN (" + in + ")"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_models m WHERE m.car_brand_id = b.id)"
                + " AND NOT EXISTS (SELECT 1 FROM vehicle_listings v WHERE v.car_brand_id = b.id)", keys);
        log.info("Pruned {} stale vehicle model(s) and {} stale brand(s)", models, brands);
    }

    /** Types not in types.json are removed unless a listing or model still points at them (see {@link CatalogLegacyPruner}). */
    private void pruneStaleTypes(Set<String> definedTypeKeys) {
        legacyPruner.prune("vehicle_types", definedTypeKeys);
    }

    /**
     * Moves listings whose model left the seed files (e.g. a van moved from CAR to COMMERCIAL) onto the
     * seeded model with the same brand and name. Generation, trim and engine/version are matched by name
     * (engine also by fuel); what has no match is cleared, as is a body type the new type does not allow.
     * A listing without exactly one matching model stays where it is, and its model is kept.
     */
    private void relinkListingsOfUnseededModels(Set<UUID> seededModelIds) {
        String seeded = toUuidArrayLiteral(seededModelIds);
        List<Map<String, Object>> listings = jdbcTemplate.queryForList(
                "SELECT v.id, v.vehicle_model_id, m.car_brand_id, m.name AS model_name, g.name AS generation_name,"
                        + " e.name AS engine_name, e.fuel_type AS engine_fuel, t.name AS trim_name,"
                        + " v.vehicle_version_id, v.body_type"
                        + " FROM vehicle_listings v JOIN vehicle_models m ON m.id = v.vehicle_model_id"
                        + " LEFT JOIN vehicle_generations g ON g.id = v.vehicle_generation_id"
                        + " LEFT JOIN vehicle_engines e ON e.id = v.vehicle_engine_id"
                        + " LEFT JOIN vehicle_trims t ON t.id = v.vehicle_trim_id"
                        + " WHERE NOT (v.vehicle_model_id = ANY('" + seeded + "'::uuid[]))");
        Map<UUID, VehicleType> typesById = new HashMap<>();
        typesByKey.values().forEach(t -> typesById.put(t.getId(), t));

        for (Map<String, Object> row : listings) {
            List<Map<String, Object>> targets = jdbcTemplate.queryForList(
                    "SELECT id, vehicle_type_id FROM vehicle_models WHERE car_brand_id = ? AND LOWER(name) = LOWER(?)"
                            + " AND id = ANY('" + seeded + "'::uuid[])",
                    row.get("car_brand_id"), row.get("model_name"));
            if (targets.size() != 1) {
                log.warn("Listing {} stays on model {} ({}), which left the seed files: {} same-name seeded model(s)",
                        row.get("id"), row.get("vehicle_model_id"), row.get("model_name"), targets.size());
                continue;
            }
            UUID modelId = (UUID) targets.get(0).get("id");
            VehicleType type = typesById.get((UUID) targets.get(0).get("vehicle_type_id"));
            UUID generationId = singleId("SELECT id FROM vehicle_generations WHERE vehicle_model_id = ? AND LOWER(name) = LOWER(?)",
                    modelId, row.get("generation_name"));
            UUID engineId = generationId == null ? null : singleId(
                    "SELECT id FROM vehicle_engines WHERE vehicle_generation_id = ? AND LOWER(name) = LOWER(?)"
                            + " AND COALESCE(fuel_type, '') = ?", generationId, row.get("engine_name"),
                    Objects.toString(row.get("engine_fuel"), ""));
            UUID versionId = engineId == null || row.get("vehicle_version_id") == null ? null
                    : singleId("SELECT id FROM vehicle_versions WHERE id = ?", engineId);
            UUID trimId = generationId == null ? null : singleId(
                    "SELECT id FROM vehicle_trims WHERE vehicle_generation_id = ? AND LOWER(name) = LOWER(?)",
                    generationId, row.get("trim_name"));
            String bodyType = (String) row.get("body_type");
            boolean bodyAllowed = type != null && type.getBodyTypes().stream().anyMatch(b -> b.name().equals(row.get("body_type")));
            if (bodyType != null && !bodyAllowed) {
                log.warn("Listing {}: body type {} is not allowed for {}; cleared", row.get("id"), bodyType,
                        type == null ? "?" : type.getName());
                bodyType = null;
            }
            jdbcTemplate.update("UPDATE vehicle_listings SET vehicle_type_id = ?, vehicle_model_id = ?,"
                            + " vehicle_generation_id = ?, vehicle_engine_id = ?, vehicle_version_id = ?, vehicle_trim_id = ?,"
                            + " body_type = ? WHERE id = ?",
                    targets.get(0).get("vehicle_type_id"), modelId, generationId, engineId, versionId, trimId, bodyType,
                    row.get("id"));
            log.info("Listing {} moved from model {} to {} ({}); generation {}, engine {}, trim {}", row.get("id"),
                    row.get("vehicle_model_id"), modelId, type == null ? "?" : type.getName(),
                    generationId != null ? "kept" : "cleared", engineId != null ? "kept" : "cleared",
                    trimId != null ? "kept" : "cleared");
        }
    }

    private UUID singleId(String sql, Object... args) {
        if (Arrays.stream(args).anyMatch(Objects::isNull)) {
            return null;
        }
        List<UUID> ids = jdbcTemplate.queryForList(sql, UUID.class, args);
        return ids.size() == 1 ? ids.get(0) : null;
    }

    private static String toUuidArrayLiteral(Set<UUID> ids) {
        StringJoiner joiner = new StringJoiner(",", "{", "}");
        ids.forEach(id -> joiner.add(id.toString()));
        return joiner.toString();
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
        brandsByKey.put(normalizedKey, brandRepository.save(brand));
    }

    private void upsertType(VehicleTypeDefinitionDto definition) {
        String normalizedKey = normalizeKey(definition.getType());
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
        type.setLabel(definition.getLabel());
        type.setSortOrder(definition.getSortOrder() == null ? 0 : definition.getSortOrder());
        type.setBodyTypes(new ArrayList<>(definition.getBodyTypes().stream()
                .map(b -> BodyType.valueOf(b.trim().toUpperCase(Locale.ROOT))).toList()));
        Map<String, VehicleFieldRule> rules = new LinkedHashMap<>();
        definition.getFields().forEach((field, rule) ->
                rules.put(field, VehicleFieldRule.valueOf(rule.trim().toUpperCase(Locale.ROOT))));
        type.setFieldRules(rules);
        typesByKey.put(normalizedKey, typeRepository.save(type));
    }

    private void evictVehicleCaches() {
        Optional.ofNullable(cacheManager.getCache("catalog:brands")).ifPresent(cache -> cache.clear());
        Optional.ofNullable(cacheManager.getCache("catalog:vehicleTypes")).ifPresent(cache -> cache.clear());
        Optional.ofNullable(cacheManager.getCache(VehicleCatalogService.CACHE_NAME)).ifPresent(cache -> cache.clear());
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
        return SeedKeyNormalizer.toKey(key);
    }
}
