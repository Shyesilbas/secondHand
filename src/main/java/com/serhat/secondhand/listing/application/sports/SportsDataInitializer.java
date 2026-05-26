package com.serhat.secondhand.listing.application.sports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Optional;

/**
 * Seeds sports reference data (disciplines, equipment types, conditions)
 * from {@code classpath:seed/sports.json}.
 *
 * <p>Uses an <b>upsert</b> strategy for all entities.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SportsDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "seed/sports.json";

    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String key() {
        return "sports";
    }

    @Override
    public Result<Void> run() {
        try {
            JsonNode root = loadCatalog();
            seedDisciplines(root.get("disciplines"));
            seedEquipmentTypes(root.get("equipmentTypes"));
            seedConditions(root.get("conditions"));
            log.info("Sports seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Sports seed failed", e);
            return Result.error("Sports seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    // ── JSON Loading ────────────────────────────────────────────────────

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    // ── Discipline Seeding ──────────────────────────────────────────────

    private void seedDisciplines(JsonNode disciplinesNode) {
        if (disciplinesNode == null || !disciplinesNode.isArray()) return;
        for (JsonNode node : disciplinesNode) {
            upsertDiscipline(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertDiscipline(String key, String label) {
        Optional<SportDiscipline> existing = sportDisciplineRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            SportDiscipline discipline = existing.get();
            discipline.setLabel(label);
            sportDisciplineRepository.save(discipline);
            return;
        }
        SportDiscipline discipline = new SportDiscipline();
        discipline.setName(key);
        discipline.setLabel(label);
        sportDisciplineRepository.save(discipline);
    }

    // ── Equipment Type Seeding ──────────────────────────────────────────

    private void seedEquipmentTypes(JsonNode equipmentTypesNode) {
        if (equipmentTypesNode == null || !equipmentTypesNode.isArray()) return;
        for (JsonNode node : equipmentTypesNode) {
            upsertEquipmentType(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertEquipmentType(String key, String label) {
        Optional<SportEquipmentType> existing = sportEquipmentTypeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            SportEquipmentType type = existing.get();
            type.setLabel(label);
            sportEquipmentTypeRepository.save(type);
            return;
        }
        SportEquipmentType type = new SportEquipmentType();
        type.setName(key);
        type.setLabel(label);
        sportEquipmentTypeRepository.save(type);
    }

    // ── Condition Seeding ───────────────────────────────────────────────

    private void seedConditions(JsonNode conditionsNode) {
        if (conditionsNode == null || !conditionsNode.isArray()) return;
        for (JsonNode node : conditionsNode) {
            upsertCondition(node.get("key").asText(), node.get("label").asText());
        }
    }

    private void upsertCondition(String key, String label) {
        Optional<SportCondition> existing = sportConditionRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            SportCondition condition = existing.get();
            condition.setLabel(label);
            sportConditionRepository.save(condition);
            return;
        }
        SportCondition condition = new SportCondition();
        condition.setName(key);
        condition.setLabel(label);
        sportConditionRepository.save(condition);
    }
}
