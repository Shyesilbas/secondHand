package com.serhat.secondhand.listing.application.realestate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateCategory;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import com.serhat.secondhand.listing.validation.realestate.RealEstateSpecFields;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Seeds real estate reference data (property types with category and field rules, ad types, heating types,
 * owner types) from {@code data/realestate/realestate.json}.
 *
 * <p>Uses a <b>deterministic-UUID upsert</b> strategy:
 * <ul>
 *   <li>Each entry in the JSON carries a fixed {@code id} field.</li>
 *   <li>On first run the row is INSERTed with that UUID.</li>
 *   <li>On subsequent runs the existing row is found by UUID and its label is updated.</li>
 * </ul>
 * This guarantees that UUIDs are stable across environments (dev, staging, prod, CI)
 * so that FK references in {@code real_estate_listings} remain valid regardless of
 * which environment produced the seed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RealEstateDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "data/realestate/realestate.json";

    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;
    private final ObjectMapper objectMapper;
    private final CatalogLegacyPruner legacyPruner;

    @Override
    public String key() {
        return "realestate";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            alignNames(realEstateTypeRepository, root.get("propertyTypes"), RealEstateType::getId, RealEstateType::getName,
                    (t, n) -> { t.setName(n); t.markNotNew(); });
            alignNames(realEstateAdTypeRepository, root.get("adTypes"), RealEstateAdType::getId, RealEstateAdType::getName,
                    (t, n) -> { t.setName(n); t.markNotNew(); });
            alignNames(heatingTypeRepository, root.get("heatingTypes"), HeatingType::getId, HeatingType::getName,
                    (t, n) -> { t.setName(n); t.markNotNew(); });
            alignNames(listingOwnerTypeRepository, root.get("ownerTypes"), ListingOwnerType::getId, ListingOwnerType::getName,
                    (t, n) -> { t.setName(n); t.markNotNew(); });

            seedPropertyTypes(root.get("propertyTypes"));
            seedAdTypes(root.get("adTypes"));
            seedHeatingTypes(root.get("heatingTypes"));
            seedOwnerTypes(root.get("ownerTypes"));

            legacyPruner.prune("real_estate_types", keys(root.get("propertyTypes")));
            legacyPruner.prune("real_estate_ad_types", keys(root.get("adTypes")));
            legacyPruner.prune("heating_types", keys(root.get("heatingTypes")));
            legacyPruner.prune("listing_owner_types", keys(root.get("ownerTypes")));
            log.info("Real estate seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Real estate seed failed", e);
            return Result.error("Real estate seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private Set<String> keys(JsonNode nodes) {
        return StreamSupport.stream(nodes.spliterator(), false)
                .map(n -> n.get("key").asText())
                .collect(Collectors.toSet());
    }

    /**
     * Rows are matched by the JSON id, so a row seeded earlier under a different key keeps its old
     * {@code name} while only the label changes (name and label drift apart). Names are unique, so
     * before the upserts rename every row that holds a key it should not: ids of this catalog get
     * freed to be renamed to their JSON key, legacy rows are parked under {@code LEGACY_<id>}.
     */
    private <T> void alignNames(JpaRepository<T, UUID> repository, JsonNode nodes,
                                Function<T, UUID> idOf, Function<T, String> nameOf, BiConsumer<T, String> rename) {
        Map<UUID, String> keyById = new HashMap<>();
        nodes.forEach(n -> keyById.put(UUID.fromString(n.get("id").asText()), n.get("key").asText()));
        Set<String> keys = Set.copyOf(keyById.values());
        for (T row : repository.findAll()) {
            String name = nameOf.apply(row);
            if (keys.contains(name) && !name.equals(keyById.get(idOf.apply(row)))) {
                rename.accept(row, "LEGACY_" + idOf.apply(row));
                repository.save(row);
            }
        }
        repository.flush();
    }

    // ── Property Type Seeding ───────────────────────────────────────────

    private void seedPropertyTypes(JsonNode propertyTypesNode) {
        if (propertyTypesNode == null || !propertyTypesNode.isArray()) return;
        for (JsonNode node : propertyTypesNode) {
            String key = node.get("key").asText();
            upsertPropertyType(
                    UUID.fromString(node.get("id").asText()),
                    key,
                    node.get("label").asText(),
                    RealEstateCategory.valueOf(node.get("category").asText()),
                    node.path("sortOrder").asInt(0),
                    fieldRules(key, node.get("fields"))
            );
        }
    }

    /** Every type names every field of {@link RealEstateSpecFields}; toggles cannot be REQUIRED. */
    private Map<String, SpecFieldRule> fieldRules(String typeKey, JsonNode fields) {
        if (fields == null || !fields.isObject()) {
            throw new IllegalStateException("Real estate type " + typeKey + " has no \"fields\" rules");
        }
        Map<String, SpecFieldRule> rules = new LinkedHashMap<>();
        fields.fields().forEachRemaining(e -> rules.put(e.getKey(), SpecFieldRule.valueOf(e.getValue().asText())));
        if (!rules.keySet().equals(RealEstateSpecFields.ALL.keySet())) {
            throw new IllegalStateException("Real estate type " + typeKey + " must rule exactly the fields "
                    + RealEstateSpecFields.ALL.keySet());
        }
        RealEstateSpecFields.ALL.values().stream()
                .filter(f -> f.toggle() && rules.get(f.name()) == SpecFieldRule.REQUIRED)
                .findFirst()
                .ifPresent(f -> {
                    throw new IllegalStateException("Toggle " + f.name() + " cannot be REQUIRED (" + typeKey + ")");
                });
        return rules;
    }

    private void upsertPropertyType(UUID id, String key, String label, RealEstateCategory category, int sortOrder,
                                    Map<String, SpecFieldRule> rules) {
        RealEstateType type = realEstateTypeRepository.findById(id).orElse(null);
        if (type == null) {
            type = new RealEstateType();
            type.setId(id);
            // isNew defaults to true → Spring Data will INSERT
        } else {
            type.markNotNew();
        }
        type.setName(key);
        type.setLabel(label);
        type.setCategory(category);
        type.setSortOrder(sortOrder);
        type.setFieldRules(rules);
        realEstateTypeRepository.save(type);
    }

    // ── Ad Type Seeding ─────────────────────────────────────────────────

    private void seedAdTypes(JsonNode adTypesNode) {
        if (adTypesNode == null || !adTypesNode.isArray()) return;
        for (JsonNode node : adTypesNode) {
            upsertAdType(
                    UUID.fromString(node.get("id").asText()),
                    node.get("key").asText(),
                    node.get("label").asText()
            );
        }
    }

    private void upsertAdType(UUID id, String key, String label) {
        Optional<RealEstateAdType> existing = realEstateAdTypeRepository.findById(id);
        if (existing.isPresent()) {
            RealEstateAdType type = existing.get();
            type.setName(key);
            type.setLabel(label);
            type.markNotNew();
            realEstateAdTypeRepository.save(type);
            return;
        }
        RealEstateAdType type = new RealEstateAdType();
        type.setId(id);
        type.setName(key);
        type.setLabel(label);
        realEstateAdTypeRepository.save(type);
    }

    // ── Heating Type Seeding ────────────────────────────────────────────

    private void seedHeatingTypes(JsonNode heatingTypesNode) {
        if (heatingTypesNode == null || !heatingTypesNode.isArray()) return;
        for (JsonNode node : heatingTypesNode) {
            upsertHeatingType(
                    UUID.fromString(node.get("id").asText()),
                    node.get("key").asText(),
                    node.get("label").asText()
            );
        }
    }

    private void upsertHeatingType(UUID id, String key, String label) {
        Optional<HeatingType> existing = heatingTypeRepository.findById(id);
        if (existing.isPresent()) {
            HeatingType type = existing.get();
            type.setName(key);
            type.setLabel(label);
            type.markNotNew();
            heatingTypeRepository.save(type);
            return;
        }
        HeatingType type = new HeatingType();
        type.setId(id);
        type.setName(key);
        type.setLabel(label);
        heatingTypeRepository.save(type);
    }

    // ── Owner Type Seeding ──────────────────────────────────────────────

    private void seedOwnerTypes(JsonNode ownerTypesNode) {
        if (ownerTypesNode == null || !ownerTypesNode.isArray()) return;
        for (JsonNode node : ownerTypesNode) {
            upsertOwnerType(
                    UUID.fromString(node.get("id").asText()),
                    node.get("key").asText(),
                    node.get("label").asText()
            );
        }
    }

    private void upsertOwnerType(UUID id, String key, String label) {
        Optional<ListingOwnerType> existing = listingOwnerTypeRepository.findById(id);
        if (existing.isPresent()) {
            ListingOwnerType type = existing.get();
            type.setName(key);
            type.setLabel(label);
            type.markNotNew();
            listingOwnerTypeRepository.save(type);
            return;
        }
        ListingOwnerType type = new ListingOwnerType();
        type.setId(id);
        type.setName(key);
        type.setLabel(label);
        listingOwnerTypeRepository.save(type);
    }
}
