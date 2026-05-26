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

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    public List<Map<String, Object>> getCarBrands() {
        return carBrandRepository.findAll().stream()
                .sorted(Comparator.comparing(b -> Optional.ofNullable(b.getLabel()).orElse("")))
                .map(brand -> {
                    Map<String, Object> brandMap = new LinkedHashMap<>();
                    brandMap.put("id", brand.getId());
                    brandMap.put("name", brand.getName());
                    brandMap.put("label", brand.getLabel());
                    return brandMap;
                })
                .toList();
    }

    public List<Map<String, Object>> getVehicleModels() {
        return vehicleModelRepository.findAll().stream()
                .sorted(Comparator.comparing(m -> Optional.ofNullable(m.getName()).orElse("")))
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
    }

    public List<Map<String, Object>> getVehicleTypes() {
        return vehicleTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse("")))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getElectronicTypes() {
        return electronicTypeRepository.findAll().stream()
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", type.getLabel());
                    return map;
                }).toList();
    }

    public List<Map<String, Object>> getElectronicBrands() {
        return electronicBrandRepository.findAll().stream()
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", brand.getLabel());
                    return map;
                }).toList();
    }

    public List<Map<String, Object>> getElectronicModels() {
        return electronicModelRepository.findAll().stream()
                .map(model -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", model.getId());
                    map.put("name", model.getName());
                    map.put("brandId", model.getBrand() != null ? model.getBrand().getId() : null);
                    map.put("typeId", model.getType() != null ? model.getType().getId() : null);
                    return map;
                }).toList();
    }

    public List<Map<String, Object>> getRealEstateTypes() {
        return realEstateTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse("")))
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getRealEstateAdTypes() {
        return realEstateAdTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse("")))
                .map(adType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", adType.getId());
                    map.put("name", adType.getName());
                    map.put("label", adType.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getHeatingTypes() {
        return heatingTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse("")))
                .map(heatingType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", heatingType.getId());
                    map.put("name", heatingType.getName());
                    map.put("label", heatingType.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getOwnerTypes() {
        return listingOwnerTypeRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getLabel()).orElse("")))
                .map(ownerType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", ownerType.getId());
                    map.put("name", ownerType.getName());
                    map.put("label", ownerType.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getClothingBrands() {
        return clothingBrandRepository.findAll().stream()
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", brand.getId());
                    map.put("name", brand.getName());
                    map.put("label", brand.getLabel());
                    return map;
                }).toList();
    }

    public List<Map<String, Object>> getClothingTypes() {
        return clothingTypeRepository.findAll().stream()
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", type.getId());
                    map.put("name", type.getName());
                    map.put("label", type.getLabel());
                    return map;
                }).toList();
    }

    public List<Map<String, Object>> getBookTypes() {
        return bookTypeRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(com.serhat.secondhand.listing.domain.entity.enums.books.BookType::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("name", t.getName());
                    map.put("label", t.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getBookGenres() {
        return bookGenreRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BookGenre::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(g -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", g.getId());
                    map.put("name", g.getName());
                    map.put("label", g.getLabel());
                    map.put("bookTypeId", g.getBookType() != null ? g.getBookType().getId() : null);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getBookLanguages() {
        return bookLanguageRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BookLanguage::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(lang -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", lang.getId());
                    map.put("name", lang.getName());
                    map.put("label", lang.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getBookFormats() {
        return bookFormatRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BookFormat::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(fmt -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", fmt.getId());
                    map.put("name", fmt.getName());
                    map.put("label", fmt.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getBookConditions() {
        return bookConditionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BookCondition::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(cond -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", cond.getId());
                    map.put("name", cond.getName());
                    map.put("label", cond.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getSportDisciplines() {
        return sportDisciplineRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(SportDiscipline::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", v.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getSportEquipmentTypes() {
        return sportEquipmentTypeRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(SportEquipmentType::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", v.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getSportConditions() {
        return sportConditionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(SportCondition::getLabel, String.CASE_INSENSITIVE_ORDER))
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", v.getId());
                    map.put("name", v.getName());
                    map.put("label", v.getLabel());
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getVehicleGenerations() {
        return vehicleGenerationRepository.findAll().stream()
                .sorted(Comparator.comparing(g -> Optional.ofNullable(g.getName()).orElse("")))
                .map(gen -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", gen.getId());
                    map.put("name", gen.getName());
                    map.put("modelId", gen.getModel() != null ? gen.getModel().getId() : null);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getVehicleEngines() {
        return vehicleEngineRepository.findAll().stream()
                .sorted(Comparator.comparing(e -> Optional.ofNullable(e.getName()).orElse("")))
                .map(eng -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", eng.getId());
                    map.put("name", eng.getName());
                    map.put("generationId", eng.getGeneration() != null ? eng.getGeneration().getId() : null);
                    map.put("fuelType", eng.getFuelType() != null ? eng.getFuelType().name() : null);
                    return map;
                })
                .toList();
    }

    public List<Map<String, Object>> getVehicleTrims() {
        return vehicleTrimRepository.findAll().stream()
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getName()).orElse("")))
                .map(trim -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", trim.getId());
                    map.put("name", trim.getName());
                    map.put("generationId", trim.getGeneration() != null ? trim.getGeneration().getId() : null);
                    return map;
                })
                .toList();
    }
}
