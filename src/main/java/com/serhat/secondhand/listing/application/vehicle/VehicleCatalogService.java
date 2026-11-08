package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleCatalogItemDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Level-by-level reads of the vehicle catalog for the listing form (type -> brand -> model -> generation
 * -> version -> trim). Cached in {@code catalog:vehicle}; the vehicle seed and the seed runner clear it.
 * A {@code year} narrows generations/versions to those sold in that model year.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleCatalogService {

    public static final String CACHE_NAME = "catalog:vehicle";

    private static final Comparator<VehicleCatalogItemDto> BY_LABEL =
            Comparator.comparing(i -> Optional.ofNullable(i.getLabel()).orElse(""), String.CASE_INSENSITIVE_ORDER);

    private final VehicleTypeRepository typeRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleGenerationRepository generationRepository;
    private final VehicleVersionRepository versionRepository;
    private final VehicleTrimRepository trimRepository;
    private final ListingAttributeCatalogService attributeCatalogService;

    @Cacheable(cacheNames = CACHE_NAME, key = "'types'")
    public List<VehicleCatalogItemDto> types() {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        typeRepository.findAll().forEach(t -> result.add(base(t.getId(), t.getName(), t.getLabel())));
        result.sort(BY_LABEL);
        return result;
    }

    @Cacheable(cacheNames = CACHE_NAME, key = "'brands:' + #typeId")
    public List<VehicleCatalogItemDto> brands(UUID typeId) {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        modelRepository.findBrandsByTypeId(typeId).forEach(b -> result.add(base(b.getId(), b.getName(), b.getLabel())));
        result.sort(BY_LABEL);
        return result;
    }

    @Cacheable(cacheNames = CACHE_NAME, key = "'models:' + #brandId + ':' + #typeId")
    public List<VehicleCatalogItemDto> models(UUID brandId, UUID typeId) {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        for (VehicleModel m : modelRepository.findByBrand_IdAndType_IdOrderByNameAsc(brandId, typeId)) {
            VehicleCatalogItemDto dto = base(m.getId(), m.getName(), m.getName());
            List<BodyType> bodyTypes = new ArrayList<>(m.getSupportedBodyTypes());
            bodyTypes.sort(Comparator.naturalOrder());
            dto.setBodyTypes(bodyTypes);
            result.add(dto);
        }
        return result;
    }

    @Cacheable(cacheNames = CACHE_NAME, key = "'generations:' + #modelId + ':' + #year")
    public List<VehicleCatalogItemDto> generations(UUID modelId, Integer year) {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        for (VehicleGeneration g : generationRepository.findByModel_Id(modelId)) {
            if (!coversYear(g.getStartYear(), g.getEndYear(), year)) {
                continue;
            }
            VehicleCatalogItemDto dto = base(g.getId(), g.getName(), g.getName());
            dto.setStartYear(g.getStartYear());
            dto.setEndYear(g.getEndYear());
            dto.setBodyType(g.getBodyType());
            dto.setDoors(g.getDoors());
            dto.setSeatCount(g.getSeatCount());
            dto.setFacelift(g.isFacelift());
            result.add(dto);
        }
        result.sort(Comparator.comparing((VehicleCatalogItemDto i) ->
                Optional.ofNullable(i.getStartYear()).orElse(0)).thenComparing(BY_LABEL));
        return result;
    }

    @Cacheable(cacheNames = CACHE_NAME, key = "'versions:' + #generationId + ':' + #year")
    public List<VehicleCatalogItemDto> versions(UUID generationId, Integer year) {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        for (VehicleVersion v : versionRepository.findByGeneration_IdOrderByNameAsc(generationId)) {
            if (!coversYear(v.effectiveStartYear(), v.effectiveEndYear(), year)) {
                continue;
            }
            VehicleCatalogItemDto dto = base(v.getId(), v.getName(), v.getName());
            dto.setStartYear(v.getStartYear());
            dto.setEndYear(v.getEndYear());
            dto.setFuelType(v.getFuelType());
            dto.setEngineCapacity(v.getEngineCapacity());
            dto.setHorsePower(v.getHorsePower());
            dto.setPowerKw(v.getPowerKw());
            dto.setTorqueNm(v.getTorqueNm());
            dto.setGearbox(v.getGearbox());
            dto.setGearCount(v.getGearCount());
            dto.setDrivetrain(v.getDrivetrain());
            dto.setListPriceTry(v.getListPriceTry());
            dto.setSource(v.getSource());
            dto.setSpecs(new LinkedHashMap<>(v.getSpecs() != null ? v.getSpecs() : Map.of()));
            List<UUID> trimIds = new ArrayList<>();
            v.getTrims().forEach(t -> trimIds.add(t.getId()));
            dto.setTrimIds(trimIds);
            result.add(dto);
        }
        return result;
    }

    @Cacheable(cacheNames = CACHE_NAME, key = "'trims:' + #generationId")
    public List<VehicleCatalogItemDto> trims(UUID generationId) {
        List<VehicleCatalogItemDto> result = new ArrayList<>();
        trimRepository.findByGeneration_Id(generationId)
                .forEach(t -> result.add(base(t.getId(), t.getName(), t.getName())));
        result.sort(BY_LABEL);
        return result;
    }

    /** Attribute definitions of a vehicle type (scope = the type's name, e.g. CAR). */
    public Result<List<AttributeDefinitionDto>> attributes(UUID typeId) {
        return typeRepository.findById(typeId)
                .<Result<List<AttributeDefinitionDto>>>map(type -> Result.success(
                        attributeCatalogService.getDefinitions(ListingType.VEHICLE, type.getName())))
                .orElseGet(() -> Result.error("Vehicle type not found", "VEHICLE_TYPE_NOT_FOUND"));
    }

    private static boolean coversYear(Integer start, Integer end, Integer year) {
        if (year == null) {
            return true;
        }
        return (start == null || year >= start) && (end == null || year <= end);
    }

    private static VehicleCatalogItemDto base(UUID id, String name, String label) {
        VehicleCatalogItemDto dto = new VehicleCatalogItemDto();
        dto.setId(id);
        dto.setName(name);
        dto.setLabel(label != null ? label : name);
        return dto;
    }
}
