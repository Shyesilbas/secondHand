package com.serhat.secondhand.core.application;

import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleVersion;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleEngineRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleGenerationRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTrimRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTypeRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnumReadService {

    public static final String CACHE_NAME = "catalog:enums";

    private final ElectronicTypeRepository electronicTypeRepository;
    private final ElectronicBrandRepository electronicBrandRepository;
    private final ElectronicModelRepository electronicModelRepository;
    private final ElectronicModelVariantRepository electronicModelVariantRepository;
    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;
    private final ClothingBrandRepository clothingBrandRepository;
    private final ClothingTypeRepository clothingTypeRepository;
    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;
    private final CarBrandRepository carBrandRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleGenerationRepository vehicleGenerationRepository;
    private final VehicleEngineRepository vehicleEngineRepository;
    private final VehicleTrimRepository vehicleTrimRepository;
    private final VehicleVersionRepository vehicleVersionRepository;
    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;
    private final ListingAttributeCatalogService listingAttributeCatalogService;
    private final SizeSystemCatalog sizeSystemCatalog;

    /**
     * Fetches all database-backed catalog sections inside a single read-only transaction and caches
     * them as a Redis bundle under {@code v4:catalog:enums:dbBundle}.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'dbBundle'")
    public Map<String, Object> getCatalogEnumBundle() {
        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("carBrands", buildCarBrands());
        bundle.put("vehicleTypes", buildVehicleTypes());
        bundle.put("vehicleModels", buildVehicleModels());
        bundle.put("vehicleGenerations", buildVehicleGenerations());
        bundle.put("vehicleEngines", buildVehicleEngines());
        bundle.put("vehicleTrims", buildVehicleTrims());
        bundle.put("electronicTypes", buildElectronicTypes());
        bundle.put("electronicBrands", buildElectronicBrands());
        bundle.put("electronicModels", buildElectronicModels());
        bundle.put("realEstateTypes", buildRealEstateTypes());
        bundle.put("realEstateAdTypes", buildRealEstateAdTypes());
        bundle.put("heatingTypes", buildHeatingTypes());
        bundle.put("ownerTypes", buildOwnerTypes());
        bundle.put("clothingBrands", buildClothingBrands());
        bundle.put("clothingTypes", buildClothingTypes());
        bundle.put("sizeSystems", buildSizeSystems());
        bundle.put("bookTypes", buildBookTypes());
        bundle.put("bookGenres", buildBookGenres());
        bundle.put("bookLanguages", buildBookLanguages());
        bundle.put("bookFormats", buildBookFormats());
        bundle.put("bookConditions", buildBookConditions());
        bundle.put("sportDisciplines", buildSportDisciplines());
        bundle.put("sportEquipmentTypes", buildSportEquipmentTypes());
        bundle.put("sportConditions", buildSportConditions());
        return bundle;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'carBrands'")
    public List<Map<String, Object>> getCarBrands() {
        return buildCarBrands();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'vehicleModels'")
    public List<Map<String, Object>> getVehicleModels() {
        return buildVehicleModels();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'vehicleTypes'")
    public List<Map<String, Object>> getVehicleTypes() {
        return buildVehicleTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'electronicTypes'")
    public List<Map<String, Object>> getElectronicTypes() {
        return buildElectronicTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'electronicBrands'")
    public List<Map<String, Object>> getElectronicBrands() {
        return buildElectronicBrands();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'electronicModels'")
    public List<Map<String, Object>> getElectronicModels() {
        return buildElectronicModels();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'realEstateTypes'")
    public List<Map<String, Object>> getRealEstateTypes() {
        return buildRealEstateTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'realEstateAdTypes'")
    public List<Map<String, Object>> getRealEstateAdTypes() {
        return buildRealEstateAdTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'heatingTypes'")
    public List<Map<String, Object>> getHeatingTypes() {
        return buildHeatingTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'ownerTypes'")
    public List<Map<String, Object>> getOwnerTypes() {
        return buildOwnerTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'clothingBrands'")
    public List<Map<String, Object>> getClothingBrands() {
        return buildClothingBrands();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'clothingTypes'")
    public List<Map<String, Object>> getClothingTypes() {
        return buildClothingTypes();
    }

    /** Size systems from data/common/sizes.json: key, label, values [{value, label}]. */
    @Cacheable(value = CACHE_NAME, key = "'sizeSystems'")
    public List<Map<String, Object>> getSizeSystems() {
        return buildSizeSystems();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'bookTypes'")
    public List<Map<String, Object>> getBookTypes() {
        return buildBookTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'bookGenres'")
    public List<Map<String, Object>> getBookGenres() {
        return buildBookGenres();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'bookLanguages'")
    public List<Map<String, Object>> getBookLanguages() {
        return buildBookLanguages();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'bookFormats'")
    public List<Map<String, Object>> getBookFormats() {
        return buildBookFormats();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'bookConditions'")
    public List<Map<String, Object>> getBookConditions() {
        return buildBookConditions();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'sportDisciplines'")
    public List<Map<String, Object>> getSportDisciplines() {
        return buildSportDisciplines();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'sportEquipmentTypes'")
    public List<Map<String, Object>> getSportEquipmentTypes() {
        return buildSportEquipmentTypes();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'sportConditions'")
    public List<Map<String, Object>> getSportConditions() {
        return buildSportConditions();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'vehicleGenerations'")
    public List<Map<String, Object>> getVehicleGenerations() {
        return buildVehicleGenerations();
    }

    /**
     * Engines carry the catalog facts of their version (same id): the listing form copies them and sends the id
     * as {@code vehicleVersionId}. {@code versionId} is null for an engine without a version row.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'vehicleEngines'")
    public List<Map<String, Object>> getVehicleEngines() {
        return buildVehicleEngines();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_NAME, key = "'vehicleTrims'")
    public List<Map<String, Object>> getVehicleTrims() {
        return buildVehicleTrims();
    }

    private List<Map<String, Object>> buildCarBrands() {
        return buildSimpleCatalog(carBrandRepository.findAll(),
                b -> b.getId(), b -> b.getName(), b -> b.getLabel());
    }

    private List<Map<String, Object>> buildVehicleModels() {
        List<Map<String, Object>> raw = vehicleModelRepository.findAll().stream()
                .sorted(Comparator.comparing(m -> Optional.ofNullable(m.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(model -> {
                    Map<String, Object> modelMap = new LinkedHashMap<>();
                    modelMap.put("id", model.getId());
                    modelMap.put("name", model.getName());
                    modelMap.put("brandId", model.getBrand() != null ? model.getBrand().getId() : null);
                    modelMap.put("typeId", model.getType() != null ? model.getType().getId() : null);
                    modelMap.put("supportedBodyTypes", sanitizeList(model.getSupportedBodyTypes()));
                    return modelMap;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("brandId") + ":" + item.get("typeId") + ":" + name;
        });
    }

    private List<Map<String, Object>> buildVehicleTypes() {
        List<Map<String, Object>> raw = vehicleTypeRepository.findAll().stream()
                .sorted(Comparator.comparingInt(VehicleType::getSortOrder)
                        .thenComparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    // Form rules of the type: allowed body types and REQUIRED/OPTIONAL/HIDDEN per spec field.
                    map.put("bodyTypes", sanitizeList(type.getBodyTypes()));
                    map.put("fieldRules", sanitizeMap(type.getFieldRules()));
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildElectronicTypes() {
        List<Map<String, Object>> raw = electronicTypeRepository.findAll().stream()
                .sorted(Comparator.comparingInt(ElectronicType::getSortOrder)
                        .thenComparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    map.put("sortOrder", type.getSortOrder());
                    // Spec field -> REQUIRED | OPTIONAL | HIDDEN (data/electronics/types.json); drives form and filters.
                    map.put("fieldRules", sanitizeMap(type.getFieldRules()));
                    // Attribute keys this type defines (data/attributes/electronics.json); attribute filters follow them.
                    map.put("attributeKeys", listingAttributeCatalogService
                            .getDefinitions(ListingType.ELECTRONICS, type.getName())
                            .stream()
                            .map(AttributeDefinitionDto::getKey)
                            .collect(Collectors.toCollection(ArrayList::new)));
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildElectronicBrands() {
        List<Map<String, Object>> raw = electronicBrandRepository.findAll().stream()
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", Optional.ofNullable(brand.getLabel()).filter(l -> !l.isBlank()).orElse(brand.getName()));
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildElectronicModels() {
        // Variants ride along with their model so the form can pick one without another request.
        Map<UUID, List<Map<String, Object>>> variantsByModel = new HashMap<>();
        electronicModelVariantRepository.findAll().stream()
                .sorted(Comparator.comparingInt(ElectronicModelVariant::getSortOrder))
                .forEach(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("ram", v.getRam());
                    map.put("storage", v.getStorage());
                    map.put("storageType", v.getStorageType() != null ? v.getStorageType().name() : null);
                    map.put("processor", v.getProcessor() != null ? v.getProcessor().name() : null);
                    map.put("chipset", v.getChipset());
                    map.put("gpuModel", v.getGpuModel());
                    map.put("specs", sanitizeMap(v.getSpecs()));
                    variantsByModel.computeIfAbsent(v.getModel().getId(), k -> new ArrayList<>()).add(map);
                });
        List<Map<String, Object>> raw = electronicModelRepository.findAll().stream()
                .map(model -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", model.getId());
                    map.put("name", model.getName());
                    map.put("brandId", model.getBrand() != null ? model.getBrand().getId() : null);
                    map.put("typeId", model.getType() != null ? model.getType().getId() : null);
                    map.put("releaseYear", model.getReleaseYear());
                    map.put("isLegacy", Boolean.TRUE.equals(model.getIsLegacy()));
                    map.put("aliases", sanitizeList(model.getAliases()));
                    map.put("specs", sanitizeMap(model.getSpecs()));
                    List<Map<String, Object>> colorList = model.getColors() == null
                            ? new ArrayList<>()
                            : model.getColors().stream().map(c -> {
                                Map<String, Object> color = new LinkedHashMap<>();
                                color.put("name", c.getName());
                                color.put("color", c.getColor() != null ? c.getColor().name() : null);
                                return color;
                            }).collect(Collectors.toCollection(ArrayList::new));
                    map.put("colors", colorList);
                    map.put("variants", variantsByModel.getOrDefault(model.getId(), new ArrayList<>()));
                    map.put("catalogSource", model.getSource());
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("brandId") + ":" + item.get("typeId") + ":" + name;
        });
    }

    private List<Map<String, Object>> buildRealEstateTypes() {
        List<Map<String, Object>> raw = realEstateTypeRepository.findAll().stream()
                .sorted(Comparator.comparingInt(RealEstateType::getSortOrder)
                        .thenComparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    map.put("category", type.getCategory().name());
                    map.put("sortOrder", type.getSortOrder());
                    map.put("fieldRules", sanitizeMap(type.getFieldRules()));
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildRealEstateAdTypes() {
        return buildSimpleCatalog(realEstateAdTypeRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildHeatingTypes() {
        return buildSimpleCatalog(heatingTypeRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildOwnerTypes() {
        return buildSimpleCatalog(listingOwnerTypeRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildClothingBrands() {
        List<Map<String, Object>> raw = clothingBrandRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", Optional.ofNullable(brand.getLabel()).filter(l -> !l.isBlank()).orElse(brand.getName()));
                    map.put("segment", brand.getSegment() != null ? brand.getSegment().name() : null);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildClothingTypes() {
        List<Map<String, Object>> raw = clothingTypeRepository.findAll().stream()
                .sorted(Comparator.comparingInt(ClothingType::getSortOrder)
                        .thenComparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    map.put("group", type.getGroup() != null ? type.getGroup().name() : null);
                    map.put("sortOrder", type.getSortOrder());
                    // Audience -> allowed size systems (data/clothing/types.json); a missing audience hides the type.
                    map.put("sizeRules", sanitizeMap(type.getSizeRules()));
                    // fit / pattern / fabricType -> REQUIRED | OPTIONAL | HIDDEN.
                    map.put("fieldRules", sanitizeMap(type.getFieldRules()));
                    // Condition attributes follow the type group (data/attributes/clothing.json scopes).
                    List<String> attrKeys = type.getGroup() == null
                            ? new ArrayList<>()
                            : listingAttributeCatalogService
                                    .getDefinitions(ListingType.CLOTHING, type.getGroup().name())
                                    .stream()
                                    .map(AttributeDefinitionDto::getKey)
                                    .collect(Collectors.toCollection(ArrayList::new));
                    map.put("attributeKeys", attrKeys);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildSizeSystems() {
        return sizeSystemCatalog.all().stream().map(system -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("value", system.key());
            map.put("label", system.label());
            List<Map<String, Object>> values = system.values().stream()
                    .map(v -> {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        entry.put("value", v.key());
                        entry.put("label", v.label());
                        return entry;
                    })
                    .collect(Collectors.toCollection(ArrayList::new));
            map.put("values", values);
            return map;
        }).collect(Collectors.toCollection(ArrayList::new));
    }

    private List<Map<String, Object>> buildBookTypes() {
        return buildSimpleCatalog(bookTypeRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildBookGenres() {
        List<Map<String, Object>> raw = bookGenreRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(g -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", g.getId());
                    map.put("name", g.getName());
                    map.put("label", Optional.ofNullable(g.getLabel()).filter(l -> !l.isBlank()).orElse(g.getName()));
                    map.put("bookTypeId", g.getBookType() != null ? g.getBookType().getId() : null);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("bookTypeId") + ":" + name;
        });
    }

    private List<Map<String, Object>> buildBookLanguages() {
        return buildSimpleCatalog(bookLanguageRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildBookFormats() {
        return buildSimpleCatalog(bookFormatRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildBookConditions() {
        return buildSimpleCatalog(bookConditionRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildSportDisciplines() {
        return buildSimpleCatalog(sportDisciplineRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildSportEquipmentTypes() {
        List<Map<String, Object>> raw = sportEquipmentTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", Optional.ofNullable(v.getLabel()).filter(l -> !l.isBlank()).orElse(v.getName()));
                    map.put("disciplineId", v.getDiscipline() != null ? v.getDiscipline().getId() : null);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private List<Map<String, Object>> buildSportConditions() {
        return buildSimpleCatalog(sportConditionRepository.findAll(),
                t -> t.getId(), t -> t.getName(), t -> t.getLabel());
    }

    private List<Map<String, Object>> buildVehicleGenerations() {
        List<Map<String, Object>> raw = vehicleGenerationRepository.findAll().stream()
                .sorted(Comparator.comparing(g -> Optional.ofNullable(g.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(gen -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", gen.getId());
                    map.put("name", gen.getName());
                    map.put("modelId", gen.getModel() != null ? gen.getModel().getId() : null);
                    map.put("startYear", gen.getStartYear());
                    map.put("endYear", gen.getEndYear());
                    map.put("bodyType", gen.getBodyType() != null ? gen.getBodyType().name() : null);
                    map.put("doors", gen.getDoors() != null ? gen.getDoors().name() : null);
                    map.put("seatCount", gen.getSeatCount() != null ? gen.getSeatCount().name() : null);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("modelId") + ":" + name;
        });
    }

    private List<Map<String, Object>> buildVehicleEngines() {
        Map<UUID, VehicleVersion> versions = new HashMap<>();
        vehicleVersionRepository.findAll().forEach(v -> versions.put(v.getId(), v));
        List<Map<String, Object>> raw = vehicleEngineRepository.findAll().stream()
                .sorted(Comparator.comparing(e -> Optional.ofNullable(e.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(eng -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", eng.getId());
                    map.put("name", eng.getName());
                    map.put("generationId", eng.getGeneration() != null ? eng.getGeneration().getId() : null);
                    map.put("fuelType", eng.getFuelType() != null ? eng.getFuelType().name() : null);
                    map.put("horsePower", eng.getHorsePower());
                    map.put("engineCapacity", eng.getEngineCapacity());
                    VehicleVersion version = versions.get(eng.getId());
                    map.put("versionId", version != null ? version.getId() : null);
                    if (version != null) {
                        if (version.getHorsePower() != null) map.put("horsePower", version.getHorsePower());
                        if (version.getEngineCapacity() != null) map.put("engineCapacity", version.getEngineCapacity());
                        map.put("torqueNm", version.getTorqueNm());
                        map.put("gearbox", version.getGearbox() != null ? version.getGearbox().name() : null);
                        map.put("gearCount", version.getGearCount());
                        map.put("drivetrain", version.getDrivetrain() != null ? version.getDrivetrain().name() : null);
                        map.put("startYear", version.getStartYear());
                        map.put("endYear", version.getEndYear());
                        map.put("source", version.getSource());
                    }
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("generationId") + ":" + name + ":" + item.get("fuelType");
        });
    }

    private List<Map<String, Object>> buildVehicleTrims() {
        List<Map<String, Object>> raw = vehicleTrimRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(trim -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", trim.getId());
                    map.put("name", trim.getName());
                    map.put("generationId", trim.getGeneration() != null ? trim.getGeneration().getId() : null);
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateBy(raw, item -> {
            String name = normalizeName(item);
            return name.isBlank() ? "" : item.get("generationId") + ":" + name;
        });
    }

    private <T> List<Map<String, Object>> buildSimpleCatalog(
            List<T> items,
            Function<T, Object> idExtractor,
            Function<T, String> nameExtractor,
            Function<T, String> labelExtractor) {
        List<Map<String, Object>> raw = items.stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(labelExtractor.apply(t)).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(item -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", idExtractor.apply(item));
                    String name = nameExtractor.apply(item);
                    map.put("name", name);
                    map.put("label", Optional.ofNullable(labelExtractor.apply(item)).filter(l -> !l.isBlank()).orElse(name));
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return deduplicateByName(raw);
    }

    private String normalizeName(Map<String, Object> item) {
        Object val = item.get("name") != null ? item.get("name") : item.get("label");
        if (val == null) return "";
        String s = String.valueOf(val).trim().toUpperCase(Locale.ROOT);
        return "NULL".equals(s) ? "" : s;
    }

    private List<Map<String, Object>> deduplicateBy(
            List<Map<String, Object>> items,
            Function<Map<String, Object>, String> keyExtractor) {
        if (items == null || items.isEmpty()) return new ArrayList<>();
        Map<String, Map<String, Object>> uniqueMap = new LinkedHashMap<>();
        for (Map<String, Object> item : items) {
            String key = keyExtractor.apply(item);
            if (key == null || key.isBlank() || "NULL".equalsIgnoreCase(key)) continue;

            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, item);
            } else {
                // If existing item has raw key as label but new item has localized label, replace it.
                Map<String, Object> existing = uniqueMap.get(key);
                String existingLabel = String.valueOf(existing.get("label"));
                String newLabel = String.valueOf(item.get("label"));
                String rawName = normalizeName(item);
                if (existingLabel.equalsIgnoreCase(rawName) && !newLabel.equalsIgnoreCase(rawName)) {
                    uniqueMap.put(key, item);
                }
            }
        }
        return new ArrayList<>(uniqueMap.values());
    }

    private List<Map<String, Object>> deduplicateByName(List<Map<String, Object>> items) {
        return deduplicateBy(items, this::normalizeName);
    }

    /**
     * Converts Hibernate PersistentCollections, immutable JDK collections, and Enum values
     * into plain mutable ArrayList/LinkedHashMap/String values compatible with CacheConfig's Jackson typing.
     */
    private List<Object> sanitizeList(Collection<?> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        List<Object> result = new ArrayList<>(source.size());
        for (Object item : source) {
            result.add(sanitizeValue(item));
        }
        return result;
    }

    private Map<String, Object> sanitizeMap(Map<?, ?> source) {
        if (source == null || source.isEmpty()) {
            return new LinkedHashMap<>();
        }
        Map<String, Object> result = new LinkedHashMap<>(source.size());
        for (Map.Entry<?, ?> entry : source.entrySet()) {
            Object rawKey = entry.getKey();
            String key = rawKey instanceof Enum<?> e ? e.name() : String.valueOf(rawKey);
            result.put(key, sanitizeValue(entry.getValue()));
        }
        return result;
    }

    private Object sanitizeValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Enum<?> e) {
            return e.name();
        }
        if (value instanceof Collection<?> col) {
            return sanitizeList(col);
        }
        if (value instanceof Map<?, ?> map) {
            return sanitizeMap(map);
        }
        return value;
    }
}
