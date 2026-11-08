package com.serhat.secondhand.listing.application.attribute;

import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeOptionDto;
import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeDefinition;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.attribute.ListingAttributeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Attribute definitions of a listing type + scope; a scope-specific definition overrides an ALL one with the same key. */
@Service
@RequiredArgsConstructor
public class ListingAttributeCatalogService {

    public static final String CACHE_NAME = "catalog:attributeDefinitions";

    private final ListingAttributeDefinitionRepository definitionRepository;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CACHE_NAME,
            key = "#listingType.name() + ':' + (#scopeKey == null ? 'ALL' : #scopeKey.toUpperCase())")
    public List<AttributeDefinitionDto> getDefinitions(ListingType listingType, String scopeKey) {
        List<String> scopes = new ArrayList<>();
        scopes.add(ListingAttributeDefinition.ALL_SCOPES);
        if (scopeKey != null && !scopeKey.isBlank()) {
            scopes.add(scopeKey.toUpperCase());
        }

        Map<String, ListingAttributeDefinition> byKey = new LinkedHashMap<>();
        for (ListingAttributeDefinition def : definitionRepository
                .findByListingTypeAndScopeKeyInOrderBySortOrderAsc(listingType, scopes)) {
            ListingAttributeDefinition existing = byKey.get(def.getAttrKey());
            if (existing == null || ListingAttributeDefinition.ALL_SCOPES.equals(existing.getScopeKey())) {
                byKey.put(def.getAttrKey(), def);
            }
        }

        List<AttributeDefinitionDto> result = new ArrayList<>();
        byKey.values().stream()
                .sorted(Comparator.comparingInt(ListingAttributeDefinition::getSortOrder))
                .forEach(def -> result.add(toDto(def)));
        return result;
    }

    private AttributeDefinitionDto toDto(ListingAttributeDefinition def) {
        List<AttributeOptionDto> options = new ArrayList<>();
        def.getOptions().forEach(o -> options.add(
                new AttributeOptionDto(o.getOptionGroup(), o.getValue(), o.getLabel(), o.getSortOrder())));
        return new AttributeDefinitionDto(
                def.getAttrKey(), def.getScopeKey(), def.getLabel(), def.getUnit(), def.getDataType(), def.getLevel(),
                def.getMinValue(), def.getMaxValue(), def.isRequired(), def.isFilterable(), def.getSortOrder(), options);
    }
}
