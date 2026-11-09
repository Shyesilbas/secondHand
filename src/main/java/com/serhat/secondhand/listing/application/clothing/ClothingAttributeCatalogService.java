package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/** Attribute definitions of a clothing type (data/attributes/clothing.json, scoped by the type's group). */
@Service
@RequiredArgsConstructor
public class ClothingAttributeCatalogService {

    private final ClothingTypeRepository typeRepository;
    private final ListingAttributeCatalogService attributeCatalogService;

    public Result<List<AttributeDefinitionDto>> attributes(UUID typeId) {
        return typeRepository.findById(typeId)
                .<Result<List<AttributeDefinitionDto>>>map(type -> type.getGroup() == null
                        ? Result.error("Clothing type " + type.getName() + " has no group; run the clothing seed",
                        "CLOTHING_TYPE_RULES_MISSING")
                        : Result.success(attributeCatalogService.getDefinitions(ListingType.CLOTHING, type.getGroup().name())))
                .orElseGet(() -> Result.error("Clothing type not found", "CLOTHING_TYPE_NOT_FOUND"));
    }
}
