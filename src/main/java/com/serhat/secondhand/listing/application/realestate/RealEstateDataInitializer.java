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

/**
 * Seeds real estate reference data (property types, ad types, heating types,
 * owner types) from {@code classpath:seed/realestate.json}.
 *
 * <p>Uses an <b>upsert</b> strategy for all entities.
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
            upsertPropertyType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertPropertyType(String key, String label) {
        Optional<RealEstateType> existing = realEstateTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            RealEstateType type = existing.get();
            type.setLabel(label);
            realEstateTypeRepository.save(type);
            return;
        }
        RealEstateType type = new RealEstateType();
        type.setName(key);
        type.setLabel(label);
        realEstateTypeRepository.save(type);
    }

    // ── Ad Type Seeding ─────────────────────────────────────────────────

    private void seedAdTypes(JsonNode adTypesNode) {
        if (adTypesNode == null || !adTypesNode.isArray()) return;
        for (JsonNode node : adTypesNode) {
            upsertAdType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertAdType(String key, String label) {
        Optional<RealEstateAdType> existing = realEstateAdTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            RealEstateAdType type = existing.get();
            type.setLabel(label);
            realEstateAdTypeRepository.save(type);
            return;
        }
        RealEstateAdType type = new RealEstateAdType();
        type.setName(key);
        type.setLabel(label);
        realEstateAdTypeRepository.save(type);
    }

    // ── Heating Type Seeding ────────────────────────────────────────────

    private void seedHeatingTypes(JsonNode heatingTypesNode) {
        if (heatingTypesNode == null || !heatingTypesNode.isArray()) return;
        for (JsonNode node : heatingTypesNode) {
            upsertHeatingType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertHeatingType(String key, String label) {
        Optional<HeatingType> existing = heatingTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            HeatingType type = existing.get();
            type.setLabel(label);
            heatingTypeRepository.save(type);
            return;
        }
        HeatingType type = new HeatingType();
        type.setName(key);
        type.setLabel(label);
        heatingTypeRepository.save(type);
    }

    // ── Owner Type Seeding ──────────────────────────────────────────────

    private void seedOwnerTypes(JsonNode ownerTypesNode) {
        if (ownerTypesNode == null || !ownerTypesNode.isArray()) return;
        for (JsonNode node : ownerTypesNode) {
            upsertOwnerType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertOwnerType(String key, String label) {
        Optional<ListingOwnerType> existing = listingOwnerTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ListingOwnerType type = existing.get();
            type.setLabel(label);
            listingOwnerTypeRepository.save(type);
            return;
        }
        ListingOwnerType type = new ListingOwnerType();
        type.setName(key);
        type.setLabel(label);
        listingOwnerTypeRepository.save(type);
    }
}
