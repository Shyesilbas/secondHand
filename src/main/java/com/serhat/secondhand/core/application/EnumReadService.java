package com.serhat.secondhand.core.application;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EnumReadService {

    private final ElectronicTypeRepository electronicTypeRepository;
    private final ElectronicBrandRepository electronicBrandRepository;
    private final ElectronicModelRepository electronicModelRepository;
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
    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;

    private List<Map<String, Object>> deduplicateByName(List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) return Collections.emptyList();
        Map<String, Map<String, Object>> uniqueMap = new LinkedHashMap<>();
        for (Map<String, Object> item : items) {
            String key = String.valueOf(item.get("name") != null ? item.get("name") : item.get("label")).trim().toUpperCase(Locale.ROOT);
            if (key.isBlank() || "NULL".equals(key)) continue;

            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, item);
            } else {
                // If existing item has raw key as label but new item has localized label, replace it
                Map<String, Object> existing = uniqueMap.get(key);
                String existingLabel = String.valueOf(existing.get("label"));
                String newLabel = String.valueOf(item.get("label"));
                if (existingLabel.equals(key) && !newLabel.equals(key)) {
                    uniqueMap.put(key, item);
                }
            }
        }
        return new ArrayList<>(uniqueMap.values());
    }

    public List<Map<String, Object>> getCarBrands() {
        List<Map<String, Object>> raw = carBrandRepository.findAll().stream()
                .sorted(Comparator.comparing(b -> Optional.ofNullable(b.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(brand -> {
                    Map<String, Object> brandMap = new LinkedHashMap<>();
                    brandMap.put("id", brand.getId());
                    brandMap.put("name", brand.getName());
                    brandMap.put("label", Optional.ofNullable(brand.getLabel()).filter(l -> !l.isBlank()).orElse(brand.getName()));
                    return brandMap;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getVehicleModels() {
        List<Map<String, Object>> raw = vehicleModelRepository.findAll().stream()
                .sorted(Comparator.comparing(m -> Optional.ofNullable(m.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(model -> {
                    Map<String, Object> modelMap = new LinkedHashMap<>();
                    modelMap.put("id", model.getId());
                    modelMap.put("name", model.getName());
                    modelMap.put("brandId", model.getBrand() != null ? model.getBrand().getId() : null);
                    modelMap.put("typeId", model.getType() != null ? model.getType().getId() : null);
                    modelMap.put("supportedBodyTypes", model.getSupportedBodyTypes());
                    return modelMap;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getVehicleTypes() {
        List<Map<String, Object>> raw = vehicleTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getElectronicTypes() {
        List<Map<String, Object>> raw = electronicTypeRepository.findAll().stream()
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    return map;
                }).toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getElectronicBrands() {
        List<Map<String, Object>> raw = electronicBrandRepository.findAll().stream()
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", Optional.ofNullable(brand.getLabel()).filter(l -> !l.isBlank()).orElse(brand.getName()));
                    return map;
                }).toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getElectronicModels() {
        List<Map<String, Object>> raw = electronicModelRepository.findAll().stream()
                .map(model -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", model.getId());
                    map.put("name", model.getName());
                    map.put("brandId", model.getBrand() != null ? model.getBrand().getId() : null);
                    map.put("typeId", model.getType() != null ? model.getType().getId() : null);
                    return map;
                }).toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getRealEstateTypes() {
        List<Map<String, Object>> raw = realEstateTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getRealEstateAdTypes() {
        List<Map<String, Object>> raw = realEstateAdTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(adType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", adType.getId());
                    map.put("name", adType.getName());
                    map.put("label", Optional.ofNullable(adType.getLabel()).filter(l -> !l.isBlank()).orElse(adType.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getHeatingTypes() {
        List<Map<String, Object>> raw = heatingTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(heatingType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", heatingType.getId());
                    map.put("name", heatingType.getName());
                    map.put("label", Optional.ofNullable(heatingType.getLabel()).filter(l -> !l.isBlank()).orElse(heatingType.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getOwnerTypes() {
        List<Map<String, Object>> raw = listingOwnerTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(ownerType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", ownerType.getId());
                    map.put("name", ownerType.getName());
                    map.put("label", Optional.ofNullable(ownerType.getLabel()).filter(l -> !l.isBlank()).orElse(ownerType.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getClothingBrands() {
        List<Map<String, Object>> raw = clothingBrandRepository.findAll().stream()
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", Optional.ofNullable(brand.getLabel()).filter(l -> !l.isBlank()).orElse(brand.getName()));
                    return map;
                }).toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getClothingTypes() {
        List<Map<String, Object>> raw = clothingTypeRepository.findAll().stream()
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", Optional.ofNullable(type.getLabel()).filter(l -> !l.isBlank()).orElse(type.getName()));
                    return map;
                }).toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getBookTypes() {
        List<Map<String, Object>> raw = bookTypeRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("name", t.getName());
                    map.put("label", Optional.ofNullable(t.getLabel()).filter(l -> !l.isBlank()).orElse(t.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getBookGenres() {
        List<Map<String, Object>> raw = bookGenreRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(g -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", g.getId());
                    map.put("name", g.getName());
                    map.put("label", Optional.ofNullable(g.getLabel()).filter(l -> !l.isBlank()).orElse(g.getName()));
                    map.put("bookTypeId", g.getBookType() != null ? g.getBookType().getId() : null);
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getBookLanguages() {
        List<Map<String, Object>> raw = bookLanguageRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(lang -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", lang.getId());
                    map.put("name", lang.getName());
                    map.put("label", Optional.ofNullable(lang.getLabel()).filter(l -> !l.isBlank()).orElse(lang.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getBookFormats() {
        List<Map<String, Object>> raw = bookFormatRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(fmt -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", fmt.getId());
                    map.put("name", fmt.getName());
                    map.put("label", Optional.ofNullable(fmt.getLabel()).filter(l -> !l.isBlank()).orElse(fmt.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getBookConditions() {
        List<Map<String, Object>> raw = bookConditionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(cond -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", cond.getId());
                    map.put("name", cond.getName());
                    map.put("label", Optional.ofNullable(cond.getLabel()).filter(l -> !l.isBlank()).orElse(cond.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getSportDisciplines() {
        List<Map<String, Object>> raw = sportDisciplineRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", Optional.ofNullable(v.getLabel()).filter(l -> !l.isBlank()).orElse(v.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getSportEquipmentTypes() {
        List<Map<String, Object>> raw = sportEquipmentTypeRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", Optional.ofNullable(v.getLabel()).filter(l -> !l.isBlank()).orElse(v.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getSportConditions() {
        List<Map<String, Object>> raw = sportConditionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", Optional.ofNullable(v.getLabel()).filter(l -> !l.isBlank()).orElse(v.getName()));
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getVehicleGenerations() {
        List<Map<String, Object>> raw = vehicleGenerationRepository.findAll().stream()
                .sorted(Comparator.comparing(g -> Optional.ofNullable(g.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(gen -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", gen.getId());
                    map.put("name", gen.getName());
                    map.put("modelId", gen.getModel() != null ? gen.getModel().getId() : null);
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getVehicleEngines() {
        List<Map<String, Object>> raw = vehicleEngineRepository.findAll().stream()
                .sorted(Comparator.comparing(e -> Optional.ofNullable(e.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(eng -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", eng.getId());
                    map.put("name", eng.getName());
                    map.put("generationId", eng.getGeneration() != null ? eng.getGeneration().getId() : null);
                    map.put("fuelType", eng.getFuelType() != null ? eng.getFuelType().name() : null);
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }

    public List<Map<String, Object>> getVehicleTrims() {
        List<Map<String, Object>> raw = vehicleTrimRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getName()).orElse(""), String.CASE_INSENSITIVE_ORDER))
                .map(trim -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", trim.getId());
                    map.put("name", trim.getName());
                    map.put("generationId", trim.getGeneration() != null ? trim.getGeneration().getId() : null);
                    return map;
                })
                .toList();
        return deduplicateByName(raw);
    }
}
