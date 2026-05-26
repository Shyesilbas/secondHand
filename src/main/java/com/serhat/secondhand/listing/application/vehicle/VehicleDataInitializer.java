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
                            throw new IllegalStateException("Vehicle type cannot be null or empty in brands.json for brand: " + brandCatalog.getBrand());
                        }
                        catalogTypeKeys.add(normalizeKey(typeFile.getType()));
                    }
                }
            }

            log.info("Purging existing vehicle hierarchy references...");
            purgeVehicleHierarchy();
            pruneStaleBrands(catalogBrandKeys);
            pruneStaleTypes(catalogTypeKeys);

            log.info("Seeding brand labels and types...");
            for (VehicleBrandCatalogDto brandCatalog : brandCatalogs) {
                upsertBrand(brandCatalog.getBrand(), brandCatalog.getDisplayName());
                if (brandCatalog.getSupportedTypes() != null) {
                    for (VehicleBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                        upsertType(typeFile.getType(), typeFile.getType());
                    }
                }
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
            return objectMapper.readValue(is, new TypeReference<List<VehicleBrandCatalogDto>>() {});
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
            return objectMapper.readValue(is, new TypeReference<List<VehicleSeedModelDto>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse brand-specific catalog array " + fullPath, e);
        }
    }

    private void validateAndSeedModel(String parentBrand, String parentType, VehicleSeedModelDto modelDto, String sourceFile) {
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

        VehicleModel model = new VehicleModel();
        model.setBrand(brand);
        model.setType(type);
        model.setName(modelDto.getName());

        if (modelDto.getSupportedBodyTypes() != null) {
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
                    throw new IllegalArgumentException("Generation name cannot be null or empty under model: " + modelDto.getName());
                }
                
                VehicleGeneration generation = new VehicleGeneration();
                generation.setName(genDto.getName());
                generation.setModel(model);
                generation = generationRepository.save(generation);

                if (genDto.getEngines() != null) {
                    for (VehicleEngineDto engDto : genDto.getEngines()) {
                        if (engDto.getName() == null || engDto.getName().isBlank()) {
                            throw new IllegalArgumentException("Engine name cannot be empty under generation: " + genDto.getName());
                        }
                        
                        VehicleEngine engine = new VehicleEngine();
                        engine.setName(engDto.getName());
                        engine.setGeneration(generation);
                        
                        if (engDto.getFuelType() == null || engDto.getFuelType().isBlank()) {
                            throw new IllegalArgumentException("Fuel type cannot be empty under engine: " + engDto.getName());
                        }
                        
                        try {
                            engine.setFuelType(FuelType.valueOf(engDto.getFuelType().toUpperCase(Locale.ROOT)));
                        } catch (Exception e) {
                            throw new IllegalArgumentException(String.format(
                                    "Invalid fuel type '%s' for engine '%s' in file %s",
                                    engDto.getFuelType(), engDto.getName(), sourceFile), e);
                        }
                        engineRepository.save(engine);
                    }
                }

                if (genDto.getTrims() != null) {
                    for (String trimName : genDto.getTrims()) {
                        if (trimName == null || trimName.isBlank()) {
                            continue;
                        }
                        VehicleTrim trim = new VehicleTrim();
                        trim.setName(trimName);
                        trim.setGeneration(generation);
                        trimRepository.save(trim);
                    }
                }
            }
        }
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

    private void evictVehicleCaches() {
        Optional.ofNullable(cacheManager.getCache("brands")).ifPresent(cache -> cache.clear());
        Optional.ofNullable(cacheManager.getCache("vehicleTypes")).ifPresent(cache -> cache.clear());
    }

    private static String normalizeKey(String key) {
        return key == null ? "" : key.trim().toUpperCase(Locale.ROOT);
    }
}
