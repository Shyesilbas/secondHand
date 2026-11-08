package com.serhat.secondhand.listing.application.attribute;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeDataType;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeDefinition;
import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeOption;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.attribute.ListingAttributeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Seeds {@code listing_attribute_definitions} from {@code data/attributes/*.json} (seed key {@code attributes}).
 * Ids are derived from listing type + scope + key, so reruns update in place; definitions of a listing type that
 * are no longer in its file are removed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ListingAttributeDataInitializer implements SeedTask {

    private static final String FILES = "classpath:data/attributes/*.json";
    private static final Set<String> SOURCES = Set.of("claude-draft", "verified");

    private final ListingAttributeDefinitionRepository definitionRepository;
    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;

    @Override
    public String key() {
        return "attributes";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        try {
            Resource[] resources = new PathMatchingResourcePatternResolver().getResources(FILES);
            if (resources.length == 0) {
                throw new IllegalStateException("No attribute definition files found under " + FILES);
            }
            for (Resource resource : resources) {
                ListingAttributeSeedFileDto file;
                try (InputStream is = resource.getInputStream()) {
                    file = objectMapper.readValue(is, ListingAttributeSeedFileDto.class);
                }
                seedFile(file, resource.getFilename());
            }
            evictCache();
            return Result.success();
        } catch (Exception e) {
            log.error("Attribute definition seeding failed", e);
            throw new IllegalStateException("Attribute definition seed failure", e);
        }
    }

    private void seedFile(ListingAttributeSeedFileDto file, String fileName) {
        ListingType listingType = parseEnum(ListingType.class, file.getListingType(), "listingType", fileName);
        List<ListingAttributeSeedFileDto.Definition> definitions =
                file.getDefinitions() != null ? file.getDefinitions() : List.of();

        Map<UUID, ListingAttributeDefinition> existing = new HashMap<>();
        definitionRepository.findByListingType(listingType).forEach(d -> existing.put(d.getId(), d));

        Set<UUID> keep = new HashSet<>();
        int order = 0;
        for (ListingAttributeSeedFileDto.Definition dto : definitions) {
            String where = fileName + " / " + dto.getKey();
            if (dto.getKey() == null || !dto.getKey().matches("[a-z][A-Za-z0-9]{0,99}")) {
                throw new IllegalArgumentException("Attribute key must be camelCase: " + where);
            }
            if (dto.getLabel() == null || dto.getLabel().isBlank()) {
                throw new IllegalArgumentException("Attribute label is missing: " + where);
            }
            String scope = dto.getScope() == null || dto.getScope().isBlank()
                    ? ListingAttributeDefinition.ALL_SCOPES
                    : dto.getScope().trim().toUpperCase(Locale.ROOT);
            AttributeDataType dataType = parseEnum(AttributeDataType.class, dto.getDataType(), "dataType", where);
            AttributeLevel level = parseEnum(AttributeLevel.class, dto.getLevel(), "level", where);
            String source = dto.getSource() == null ? "claude-draft" : dto.getSource();
            if (!SOURCES.contains(source)) {
                throw new IllegalArgumentException("Unknown source '" + source + "': " + where);
            }
            boolean needsOptions = dataType == AttributeDataType.ENUM
                    || dataType == AttributeDataType.MULTI_ENUM
                    || dataType == AttributeDataType.ENUM_MAP;
            if (needsOptions && (dto.getOptions() == null || dto.getOptions().isEmpty())) {
                throw new IllegalArgumentException("Options are required for " + dataType + ": " + where);
            }
            if (dataType == AttributeDataType.ENUM_MAP && (dto.getKeys() == null || dto.getKeys().isEmpty())) {
                throw new IllegalArgumentException("Keys are required for ENUM_MAP: " + where);
            }

            UUID id = stableId("listing-attribute:" + listingType.name() + ":" + scope + ":" + dto.getKey());
            if (!keep.add(id)) {
                throw new IllegalArgumentException("Duplicate attribute for the same scope: " + where);
            }
            ListingAttributeDefinition def = existing.get(id);
            if (def == null) {
                def = new ListingAttributeDefinition();
                def.setId(id);
            }
            def.setListingType(listingType);
            def.setScopeKey(scope);
            def.setAttrKey(dto.getKey());
            def.setLabel(dto.getLabel().trim());
            def.setUnit(dto.getUnit());
            def.setDataType(dataType);
            def.setLevel(level);
            def.setMinValue(dto.getMin());
            def.setMaxValue(dto.getMax());
            def.setRequired(dto.isRequired());
            def.setFilterable(dto.isFilterable());
            def.setSortOrder(order++);
            def.setSource(source);
            syncOptions(def, ListingAttributeOption.GROUP_VALUE, dto.getOptions(), where);
            syncOptions(def, ListingAttributeOption.GROUP_KEY, dto.getKeys(), where);
            definitionRepository.save(def);
        }

        List<ListingAttributeDefinition> stale = existing.values().stream()
                .filter(d -> !keep.contains(d.getId()))
                .toList();
        definitionRepository.deleteAll(stale);
        log.info("Seeded {} attribute definition(s) for {}, removed {}", keep.size(), listingType, stale.size());
    }

    /** Updates options in place by id: delete + reinsert of the same id would break the unique key within one flush. */
    private void syncOptions(ListingAttributeDefinition def, String group,
                             List<ListingAttributeSeedFileDto.Option> options, String where) {
        List<ListingAttributeSeedFileDto.Option> wanted = options != null ? options : List.of();
        Map<UUID, ListingAttributeOption> current = new HashMap<>();
        def.getOptions().stream()
                .filter(o -> group.equals(o.getOptionGroup()))
                .forEach(o -> current.put(o.getId(), o));

        Set<UUID> keep = new HashSet<>();
        int order = 0;
        for (ListingAttributeSeedFileDto.Option dto : wanted) {
            if (dto.getValue() == null || dto.getValue().isBlank() || dto.getLabel() == null || dto.getLabel().isBlank()) {
                throw new IllegalArgumentException("Option value and label are required: " + where);
            }
            UUID id = stableId("listing-attribute-option:" + def.getId() + ":" + group + ":" + dto.getValue());
            if (!keep.add(id)) {
                throw new IllegalArgumentException("Duplicate option '" + dto.getValue() + "': " + where);
            }
            ListingAttributeOption option = current.get(id);
            if (option == null) {
                option = new ListingAttributeOption();
                option.setId(id);
                option.setDefinition(def);
                option.setOptionGroup(group);
                option.setValue(dto.getValue());
                def.getOptions().add(option);
            }
            option.setLabel(dto.getLabel().trim());
            option.setSortOrder(order++);
        }
        def.getOptions().removeIf(o -> group.equals(o.getOptionGroup()) && !keep.contains(o.getId()));
    }

    private void evictCache() {
        Optional.ofNullable(cacheManager.getCache(ListingAttributeCatalogService.CACHE_NAME))
                .ifPresent(cache -> cache.clear());
    }

    private static UUID stableId(String key) {
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String raw, String field, String where) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(field + " is missing: " + where);
        }
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown " + field + " '" + raw + "': " + where, e);
        }
    }
}
