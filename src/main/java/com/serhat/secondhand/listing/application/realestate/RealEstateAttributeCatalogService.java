package com.serhat.secondhand.listing.application.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/** Attribute definitions of a property type (data/attributes/realestate.json, scoped by the type's category). */
@Service
@RequiredArgsConstructor
public class RealEstateAttributeCatalogService {

    private final RealEstateTypeRepository typeRepository;
    private final ListingAttributeCatalogService attributeCatalogService;

    public Result<List<AttributeDefinitionDto>> attributes(UUID typeId) {
        return typeRepository.findById(typeId)
                .<Result<List<AttributeDefinitionDto>>>map(type -> Result.success(
                        attributeCatalogService.getDefinitions(ListingType.REAL_ESTATE, type.getCategory().name())))
                .orElseGet(() -> Result.error("Real estate type not found", "REAL_ESTATE_TYPE_NOT_FOUND"));
    }
}
