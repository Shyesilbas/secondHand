package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicModelCatalogDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

/**
 * Catalog reads for the electronics listing form: a model's specs, official colors and variants, and the
 * attribute definitions of a type. Not cached: one model row and its variants per call.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ElectronicCatalogService {

    private final ElectronicModelRepository modelRepository;
    private final ElectronicModelVariantRepository variantRepository;
    private final ElectronicTypeRepository typeRepository;
    private final ListingAttributeCatalogService attributeCatalogService;

    public Result<ElectronicModelCatalogDto> model(UUID modelId) {
        ElectronicModel model = modelRepository.findById(modelId).orElse(null);
        if (model == null) {
            return Result.error("Electronic model not found", "ELECTRONIC_MODEL_NOT_FOUND");
        }
        ElectronicModelCatalogDto dto = new ElectronicModelCatalogDto();
        dto.setId(model.getId());
        dto.setName(model.getName());
        dto.setReleaseYear(model.getReleaseYear());
        dto.setSource(model.getSource());
        dto.setSpecs(new LinkedHashMap<>(model.getSpecs() != null ? model.getSpecs() : java.util.Map.of()));
        if (model.getColors() != null) {
            model.getColors().forEach(c -> {
                ElectronicModelCatalogDto.ColorDto color = new ElectronicModelCatalogDto.ColorDto();
                color.setName(c.getName());
                color.setColor(c.getColor());
                color.setColorLabel(c.getColor() != null ? c.getColor().getLabel() : null);
                dto.getColors().add(color);
            });
        }
        for (ElectronicModelVariant v : variantRepository.findByModel_IdOrderBySortOrderAscNameAsc(modelId)) {
            ElectronicModelCatalogDto.VariantDto variant = new ElectronicModelCatalogDto.VariantDto();
            variant.setId(v.getId());
            variant.setName(v.getName());
            variant.setRam(v.getRam());
            variant.setStorage(v.getStorage());
            variant.setStorageType(v.getStorageType());
            variant.setProcessor(v.getProcessor());
            variant.setChipset(v.getChipset());
            variant.setGpuModel(v.getGpuModel());
            variant.setSpecs(new LinkedHashMap<>(v.getSpecs() != null ? v.getSpecs() : java.util.Map.of()));
            variant.setSource(v.getSource());
            dto.getVariants().add(variant);
        }
        return Result.success(dto);
    }

    /** Attribute definitions of an electronic type (scope = the type's name, e.g. MOBILE_PHONE). */
    public Result<List<AttributeDefinitionDto>> attributes(UUID typeId) {
        return typeRepository.findById(typeId)
                .<Result<List<AttributeDefinitionDto>>>map(type -> Result.success(
                        attributeCatalogService.getDefinitions(ListingType.ELECTRONICS, type.getName())))
                .orElseGet(() -> Result.error("Electronic type not found", "ELECTRONIC_TYPE_NOT_FOUND"));
    }
}
