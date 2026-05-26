package com.serhat.secondhand.listing.application.electronics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicBrandCatalogDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicBrandTypeFileDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicSeedModelDto;
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

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Seeds electronics reference data (brands, types, models) from
 * brand-specific and type-aware directory structure.
 *
 * <p>Uses an <b>upsert</b> strategy: existing rows are left untouched,
 * missing rows are created.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ElectronicDataInitializer implements SeedTask {

    private static final String BASE_PATH = "data/electronics/";
    private static final String BRANDS_INDEX = BASE_PATH + "brands.json";

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
            log.info("Loading electronics catalog from {}", BRANDS_INDEX);
            List<ElectronicBrandCatalogDto> brandCatalogs = loadBrandsIndex();

            for (ElectronicBrandCatalogDto brandCatalog : brandCatalogs) {
                if (brandCatalog.getBrand() == null || brandCatalog.getBrand().isBlank()) {
                    continue;
                }
                upsertBrand(brandCatalog.getBrand(), brandCatalog.getDisplayName());

                if (brandCatalog.getSupportedTypes() != null) {
                    for (ElectronicBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                        if (typeFile.getType() == null || typeFile.getType().isBlank()) {
                            continue;
                        }
                        upsertType(typeFile.getType(), formatTypeLabel(typeFile.getType()));

                        String relativePath = typeFile.getDataFile();
                        String fullPath = BASE_PATH + relativePath;
                        log.info("Loading electronics brand type file: {}", fullPath);

                        List<ElectronicSeedModelDto> models = loadBrandModelsFile(fullPath);
                        for (ElectronicSeedModelDto modelDto : models) {
                            ensureModel(brandCatalog.getBrand(), typeFile.getType(), modelDto.getName());
                        }
                    }
                }
            }

            log.info("Electronics seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Electronics seed failed critically", e);
            return Result.error("Electronics seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private List<ElectronicBrandCatalogDto> loadBrandsIndex() throws Exception {
        ClassPathResource resource = new ClassPathResource(BRANDS_INDEX);
        if (!resource.exists()) {
            throw new FileNotFoundException("Brands index file not found under: " + BRANDS_INDEX);
        }
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, new TypeReference<List<ElectronicBrandCatalogDto>>() {});
        }
    }

    private List<ElectronicSeedModelDto> loadBrandModelsFile(String fullPath) throws Exception {
        ClassPathResource resource = new ClassPathResource(fullPath);
        if (!resource.exists()) {
            throw new FileNotFoundException("Electronic data file not found under: " + fullPath);
        }
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, new TypeReference<List<ElectronicSeedModelDto>>() {});
        }
    }

    // ── Brand Seeding ───────────────────────────────────────────────────

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
        brand.setName(key.toUpperCase(Locale.ROOT));
        brand.setLabel(label);
        brandRepository.save(brand);
    }

    // ── Type Seeding ────────────────────────────────────────────────────

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
        type.setName(key.toUpperCase(Locale.ROOT));
        type.setLabel(label);
        typeRepository.save(type);
    }

    // ── Model Seeding ───────────────────────────────────────────────────

    private void ensureModel(String brandKey, String typeKey, String modelName) {
        if (brandKey == null || typeKey == null || modelName == null || modelName.isBlank()) return;

        ElectronicBrand brand = getBrand(brandKey);
        ElectronicType type = getType(typeKey);
        if (brand == null || type == null) return;

        if (modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(
                brand.getId(), type.getId(), modelName).isEmpty()) {
            ElectronicModel created = new ElectronicModel();
            created.setBrand(brand);
            created.setType(type);
            created.setName(modelName);
            modelRepository.save(created);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private ElectronicBrand getBrand(String name) {
        return name == null ? null : brandRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private ElectronicType getType(String name) {
        return name == null ? null : typeRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private String formatTypeLabel(String key) {
        if (key == null) return "";
        if (key.equalsIgnoreCase("DESKTOP")) return "Masaüstü Bilgisayar";
        if (key.equalsIgnoreCase("TV")) return "TV";
        if (key.equalsIgnoreCase("TV_STB")) return "TV STB";
        String[] parts = key.toLowerCase(Locale.ROOT).split("_");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1))
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
