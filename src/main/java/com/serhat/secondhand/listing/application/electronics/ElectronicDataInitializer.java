package com.serhat.secondhand.listing.application.electronics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicBrandCatalogDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicBrandTypeFileDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicSeedModelDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicTypeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelColor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import com.serhat.secondhand.listing.validation.electronics.ElectronicSpecFields;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Seeds electronics reference data: types with their field rules ({@code types.json}), brands
 * ({@code brands.json}) and per brand/type model files with optional catalog facts (specs, official colors,
 * variants). Upserts by deterministic ids; the JSON is the truth for labels, rules and catalog facts.
 * Variants the JSON no longer lists are removed unless a listing points to them.
 * Any invalid entry fails the seed with the file and model named.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ElectronicDataInitializer implements SeedTask {

    private static final String BASE_PATH = "data/electronics/";
    private static final String BRANDS_INDEX = BASE_PATH + "brands.json";
    private static final String TYPES_FILE = BASE_PATH + "types.json";
    private static final Set<String> SOURCES = Set.of("claude-draft", "verified");

    private final ElectronicBrandRepository brandRepository;
    private final ElectronicTypeRepository typeRepository;
    private final ElectronicModelRepository modelRepository;
    private final ElectronicModelVariantRepository variantRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "electronics";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        try {
            Map<String, ElectronicTypeDefinitionDto> typeDefinitions = loadTypeDefinitions();
            typeDefinitions.values().forEach(this::upsertType);

            log.info("Loading electronics catalog from {}", BRANDS_INDEX);
            List<ElectronicBrandCatalogDto> brandCatalogs = loadBrandsIndex();
            Map<UUID, List<ElectronicModelVariant>> variantsByModel = variantRepository.findAll().stream()
                    .collect(Collectors.groupingBy(v -> v.getModel().getId()));
            int models = 0;
            int variants = 0;

            for (ElectronicBrandCatalogDto brandCatalog : brandCatalogs) {
                if (brandCatalog.getBrand() == null || brandCatalog.getBrand().isBlank()) {
                    continue;
                }
                ElectronicBrand brand = upsertBrand(brandCatalog.getBrand(), brandCatalog.getDisplayName());
                if (brandCatalog.getSupportedTypes() == null) {
                    continue;
                }
                for (ElectronicBrandTypeFileDto typeFile : brandCatalog.getSupportedTypes()) {
                    String typeKey = normalize(typeFile.getType());
                    if (!typeDefinitions.containsKey(typeKey)) {
                        throw new IllegalArgumentException("brands.json: " + brandCatalog.getBrand()
                                + " uses type " + typeFile.getType() + " that types.json does not define");
                    }
                    ElectronicType type = typeRepository.findByNameIgnoreCase(typeKey).orElseThrow();
                    String fullPath = BASE_PATH + typeFile.getDataFile();
                    for (ElectronicSeedModelDto modelDto : loadBrandModelsFile(fullPath)) {
                        String where = typeFile.getDataFile() + " / " + modelDto.getName();
                        ElectronicModel model = upsertModel(brand, type, modelDto, where);
                        if (model == null) {
                            continue;
                        }
                        models++;
                        variants += seedVariants(model, modelDto,
                                variantsByModel.getOrDefault(model.getId(), List.of()), where);
                    }
                }
            }

            log.info("Electronics seed completed: {} types, {} models, {} variants",
                    typeDefinitions.size(), models, variants);
            return Result.success();
        } catch (Exception e) {
            log.error("Electronics seed failed critically", e);
            return Result.error("Electronics seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    Map<String, ElectronicTypeDefinitionDto> loadTypeDefinitions() throws Exception {
        List<ElectronicTypeDefinitionDto> list = readJson(TYPES_FILE, new TypeReference<>() {});
        Map<String, ElectronicTypeDefinitionDto> byType = new LinkedHashMap<>();
        for (ElectronicTypeDefinitionDto def : list) {
            String type = normalize(def.getType());
            if (type.isEmpty() || def.getLabel() == null || def.getLabel().isBlank()) {
                throw new IllegalArgumentException("types.json: every type needs a type and a label");
            }
            if (def.getFields() == null || !def.getFields().keySet().equals(ElectronicSpecFields.ALL.keySet())) {
                throw new IllegalArgumentException("types.json: " + type + " must name exactly these fields "
                        + ElectronicSpecFields.ALL.keySet() + " (null rule values are not allowed)");
            }
            if (def.getFields().containsValue(null)) {
                throw new IllegalArgumentException("types.json: " + type + " has a field without a rule");
            }
            def.setType(type);
            if (byType.put(type, def) != null) {
                throw new IllegalArgumentException("types.json: duplicate type " + type);
            }
        }
        return byType;
    }

    private List<ElectronicBrandCatalogDto> loadBrandsIndex() throws Exception {
        return readJson(BRANDS_INDEX, new TypeReference<>() {});
    }

    private List<ElectronicSeedModelDto> loadBrandModelsFile(String fullPath) throws Exception {
        return readJson(fullPath, new TypeReference<>() {});
    }

    private <T> T readJson(String path, TypeReference<T> type) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        if (!resource.exists()) {
            throw new FileNotFoundException("Electronics data file not found: " + path);
        }
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, type);
        }
    }

    private static UUID stableId(String key) {
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));
    }

    private static String normalize(String key) {
        return key == null ? "" : key.trim().toUpperCase(Locale.ROOT);
    }

    // ── Types and brands ────────────────────────────────────────────────

    private void upsertType(ElectronicTypeDefinitionDto def) {
        ElectronicType type = typeRepository.findByNameIgnoreCase(def.getType()).orElse(null);
        if (type == null) {
            type = new ElectronicType();
            type.setId(stableId("electronic-type:" + def.getType()));
            type.setName(def.getType());
        } else {
            type.setNew(false);
        }
        type.setLabel(def.getLabel().trim());
        type.setSortOrder(def.getSortOrder() != null ? def.getSortOrder() : 0);
        type.setFieldRules(new LinkedHashMap<>(def.getFields()));
        typeRepository.save(type);
    }

    private ElectronicBrand upsertBrand(String key, String label) {
        String normalizedKey = normalize(key);
        Optional<ElectronicBrand> existing = brandRepository.findByNameIgnoreCase(normalizedKey);
        if (existing.isPresent()) {
            ElectronicBrand brand = existing.get();
            brand.setNew(false);
            if (brand.getLabel() == null || brand.getLabel().isBlank()) {
                brand.setLabel(label);
                brandRepository.save(brand);
            }
            return brand;
        }
        ElectronicBrand brand = new ElectronicBrand();
        brand.setId(stableId("electronic-brand:" + normalizedKey));
        brand.setName(normalizedKey);
        brand.setLabel(label);
        return brandRepository.save(brand);
    }

    // ── Models ──────────────────────────────────────────────────────────

    ElectronicModel upsertModel(ElectronicBrand brand, ElectronicType type, ElectronicSeedModelDto dto, String where) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            return null;
        }
        boolean hasFacts = (dto.getSpecs() != null && !dto.getSpecs().isEmpty())
                || (dto.getColors() != null && !dto.getColors().isEmpty())
                || (dto.getVariants() != null && !dto.getVariants().isEmpty());
        if (hasFacts) {
            requireSource(dto.getSource(), where);
        } else if (dto.getSource() != null) {
            throw new IllegalArgumentException(where + ": source without specs, colors or variants");
        }
        Map<String, Object> specs = checkSpecs(dto.getSpecs(), Set.of(), where);
        List<ElectronicModelColor> colors = checkColors(dto.getColors(), where);

        ElectronicModel model = modelRepository
                .findByBrand_IdAndType_IdAndNameIgnoreCase(brand.getId(), type.getId(), dto.getName())
                .orElse(null);
        if (model == null) {
            model = new ElectronicModel();
            model.setId(stableId("electronic-model:" + brand.getName() + ":" + type.getName() + ":"
                    + normalize(dto.getName())));
            model.setBrand(brand);
            model.setType(type);
            model.setName(dto.getName());
        } else {
            model.setNew(false);
        }
        if (dto.getReleaseYear() != null) model.setReleaseYear(dto.getReleaseYear());
        if (dto.getIsLegacy() != null) model.setIsLegacy(dto.getIsLegacy());
        if (dto.getAliases() != null) model.setAliases(new ArrayList<>(dto.getAliases()));
        model.setSpecs(specs);
        model.setColors(colors);
        model.setSource(hasFacts ? dto.getSource() : null);
        return modelRepository.save(model);
    }

    private int seedVariants(ElectronicModel model, ElectronicSeedModelDto dto,
                             List<ElectronicModelVariant> existing, String where) {
        Map<UUID, ElectronicModelVariant> existingById = new HashMap<>();
        existing.forEach(v -> existingById.put(v.getId(), v));
        Set<UUID> keep = new HashSet<>();
        List<ElectronicSeedModelDto.Variant> variants = dto.getVariants() != null ? dto.getVariants() : List.of();
        int order = 0;
        for (ElectronicSeedModelDto.Variant v : variants) {
            String vWhere = where + " / " + v.getName();
            if (v.getName() == null || v.getName().isBlank()) {
                throw new IllegalArgumentException(where + ": variant without a name");
            }
            UUID id = stableId("electronic-variant:" + model.getId() + ":" + normalize(v.getName()));
            if (!keep.add(id)) {
                throw new IllegalArgumentException(vWhere + ": duplicate variant name");
            }
            requirePositive(v.getRam(), "ram", vWhere);
            requirePositive(v.getStorage(), "storage", vWhere);
            ElectronicModelVariant variant = existingById.get(id);
            if (variant == null) {
                variant = new ElectronicModelVariant();
                variant.setId(id);
                variant.setModel(model);
            } else {
                variant.setNew(false);
            }
            variant.setName(v.getName().trim());
            variant.setSortOrder(order++);
            variant.setRam(v.getRam());
            variant.setStorage(v.getStorage());
            variant.setStorageType(parseEnum(StorageType.class, v.getStorageType(), "storageType", vWhere));
            variant.setProcessor(parseEnum(Processor.class, v.getProcessor(), "processor", vWhere));
            variant.setChipset(blankToNull(v.getChipset()));
            variant.setGpuModel(blankToNull(v.getGpuModel()));
            variant.setSpecs(checkSpecs(v.getSpecs(), ElectronicCatalogSpecs.VARIANT_COLUMNS, vWhere));
            String source = v.getSource() != null ? v.getSource() : dto.getSource();
            requireSource(source, vWhere);
            variant.setSource(source);
            variantRepository.save(variant);
        }
        List<UUID> stale = existing.stream().map(ElectronicModelVariant::getId).filter(id -> !keep.contains(id)).toList();
        if (!stale.isEmpty()) {
            String keepIds = keep.stream().map(UUID::toString).collect(Collectors.joining(",", "{", "}"));
            int removed = variantRepository.deleteStaleUnreferenced(model.getId(), keepIds);
            if (removed < stale.size()) {
                log.warn("{}: {} stale variants kept because listings point to them", where, stale.size() - removed);
            }
        }
        return variants.size();
    }

    // ── Checks ──────────────────────────────────────────────────────────

    private static Map<String, Object> checkSpecs(Map<String, Object> raw, Set<String> forbidden, String where) {
        Map<String, Object> specs = new LinkedHashMap<>();
        if (raw == null) {
            return specs;
        }
        for (Map.Entry<String, Object> e : raw.entrySet()) {
            String key = e.getKey();
            if (forbidden.contains(key)) {
                throw new IllegalArgumentException(where + ": spec '" + key + "' is a variant column, set it directly");
            }
            ElectronicCatalogSpecs.Kind kind = ElectronicCatalogSpecs.kindOf(key);
            if (kind == null) {
                throw new IllegalArgumentException(where + ": unknown spec key '" + key + "'");
            }
            if (e.getValue() == null) {
                continue;
            }
            try {
                Object value = ElectronicCatalogSpecs.convert(key, kind, e.getValue());
                specs.put(key, value instanceof Enum<?> en ? en.name() : value);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException(where + ": " + ex.getMessage(), ex);
            }
        }
        return specs;
    }

    private static List<ElectronicModelColor> checkColors(List<ElectronicSeedModelDto.Color> raw, String where) {
        List<ElectronicModelColor> colors = new ArrayList<>();
        if (raw == null) {
            return colors;
        }
        Set<String> names = new HashSet<>();
        for (ElectronicSeedModelDto.Color c : raw) {
            if (c.getName() == null || c.getName().isBlank() || !names.add(c.getName().trim())) {
                throw new IllegalArgumentException(where + ": color names must be non-blank and unique");
            }
            Color color = parseEnum(Color.class, c.getColor(), "color", where + " / " + c.getName());
            if (color == null) {
                throw new IllegalArgumentException(where + " / " + c.getName() + ": color is required");
            }
            colors.add(new ElectronicModelColor(c.getName().trim(), color));
        }
        return colors;
    }

    private static void requireSource(String source, String where) {
        if (source == null || !SOURCES.contains(source)) {
            throw new IllegalArgumentException(where + ": source must be one of " + SOURCES + ", got " + source);
        }
    }

    private static void requirePositive(Integer value, String field, String where) {
        if (value != null && value <= 0) {
            throw new IllegalArgumentException(where + ": " + field + " must be greater than 0");
        }
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String raw, String field, String where) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, raw.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(where + ": unknown " + field + " '" + raw + "'", e);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
