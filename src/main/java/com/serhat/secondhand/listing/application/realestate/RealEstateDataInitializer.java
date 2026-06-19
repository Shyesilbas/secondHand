package com.serhat.secondhand.listing.application.realestate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

/**
 * Seeds real estate reference data (property types, ad types, heating types,
 * owner types) from {@code classpath:seed/realestate.json}.
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

    private static final String CATALOG_PATH = "seed/realestate.json";

    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "realestate";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            seedPropertyTypes(root.get("propertyTypes"));
            seedAdTypes(root.get("adTypes"));
            seedHeatingTypes(root.get("heatingTypes"));
            seedOwnerTypes(root.get("ownerTypes"));
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

    // ── Property Type Seeding ───────────────────────────────────────────

    private void seedPropertyTypes(JsonNode propertyTypesNode) {
        if (propertyTypesNode == null || !propertyTypesNode.isArray()) return;
        for (JsonNode node : propertyTypesNode) {
            upsertPropertyType(
                    UUID.fromString(node.get("id").asText()),
                    node.get("key").asText(),
                    node.get("label").asText()
            );
        }
    }

    private void upsertPropertyType(UUID id, String key, String label) {
        Optional<RealEstateType> existing = realEstateTypeRepository.findById(id);
        if (existing.isPresent()) {
            RealEstateType type = existing.get();
            type.setLabel(label);
            type.markNotNew();
            realEstateTypeRepository.save(type);
            return;
        }
        RealEstateType type = new RealEstateType();
        type.setId(id);
        type.setName(key);
        type.setLabel(label);
        // isNew defaults to true → Spring Data will INSERT
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
