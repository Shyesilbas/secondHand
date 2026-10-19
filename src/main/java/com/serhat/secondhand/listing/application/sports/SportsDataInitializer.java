package com.serhat.secondhand.listing.application.sports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.CatalogLegacyPruner;
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
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Map;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Seeds sports reference data (disciplines, equipment types, conditions)
 * from {@code classpath:data/sports/sports.json}.
 *
 * <p>Uses an <b>upsert</b> strategy with deterministic UUIDs for all entities.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SportsDataInitializer implements SeedTask {

    private static final String CATALOG_PATH = "data/sports/sports.json";

    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;
    private final ObjectMapper objectMapper;
    private final CatalogLegacyPruner legacyPruner;

    private final Set<String> seenDisciplines = new HashSet<>();
    private final Set<String> seenEquipment = new HashSet<>();
    private final Set<String> seenConditions = new HashSet<>();

    @Override
    public String key() {
        return "sports";
    }

    @Override
    public Result<Void> run() {
        try {
            seenDisciplines.clear();
            seenEquipment.clear();
            seenConditions.clear();
            JsonNode root = loadCatalog();
            seedDisciplines(root.get("disciplines"));
            seedEquipmentTypes(root.get("equipmentTypes"));
            seedConditions(root.get("conditions"));
            // equipment references discipline, so it goes first
            legacyPruner.prune("sport_equipment_types", seenEquipment);
            legacyPruner.prune("sport_disciplines", seenDisciplines);
            legacyPruner.prune("sport_conditions", seenConditions, Map.of("EXCELLENT", "LIKE_NEW"));
            log.info("Sports seed completed successfully");
            return Result.success();
        } catch (Exception e) {
            log.error("Sports seed failed", e);
            return Result.error("Sports seed failed: " + e.getMessage(), "SEED_FAILED");
        }
    }

    private JsonNode loadCatalog() throws Exception {
        try (InputStream is = new ClassPathResource(CATALOG_PATH).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private UUID generateStableUuid(String source) {
        return UUID.nameUUIDFromBytes(source.getBytes(StandardCharsets.UTF_8));
    }

    // ── Discipline Seeding ──────────────────────────────────────────────

    private void seedDisciplines(JsonNode disciplinesNode) {
        if (disciplinesNode == null || !disciplinesNode.isArray()) return;
        for (JsonNode node : disciplinesNode) {
            String key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
            String label = node.get("label").asText().trim();
            upsertDiscipline(key, label);
        }
    }

    private SportDiscipline upsertDiscipline(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenDisciplines.add(normalizedKey);
        Optional<SportDiscipline> existing = sportDisciplineRepository.findByNameIgnoreCase(normalizedKey);
        SportDiscipline discipline;
        if (existing.isPresent()) {
            discipline = existing.get();
            discipline.setNew(false);
        } else {
            discipline = new SportDiscipline();
            discipline.setId(generateStableUuid("sport-discipline:" + normalizedKey));
            discipline.setName(normalizedKey);
        }
        if (!Objects.equals(discipline.getLabel(), label)) {
            discipline.setLabel(label);
            return sportDisciplineRepository.save(discipline);
        } else if (discipline.isNew()) {
            return sportDisciplineRepository.save(discipline);
        }
        return discipline;
    }

    // ── Equipment Type Seeding ──────────────────────────────────────────

    private void seedEquipmentTypes(JsonNode equipmentTypesNode) {
        if (equipmentTypesNode == null || !equipmentTypesNode.isArray()) return;
        for (JsonNode node : equipmentTypesNode) {
            String key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
            String label = node.get("label").asText().trim();
            String disciplineKey = null;
            if (node.has("discipline")) {
                disciplineKey = node.get("discipline").asText().trim().toUpperCase(Locale.ROOT);
            } else if (key.contains("_")) {
                disciplineKey = key.substring(0, key.indexOf('_')).toUpperCase(Locale.ROOT);
            }
            upsertEquipmentType(key, label, disciplineKey);
        }
    }

    private void upsertEquipmentType(String key, String label, String disciplineKey) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenEquipment.add(normalizedKey);
        Optional<SportEquipmentType> existing = sportEquipmentTypeRepository.findByNameIgnoreCase(normalizedKey);
        SportEquipmentType type;
        if (existing.isPresent()) {
            type = existing.get();
            type.setNew(false);
        } else {
            type = new SportEquipmentType();
            type.setId(generateStableUuid("sport-equipment-type:" + normalizedKey));
            type.setName(normalizedKey);
        }

        SportDiscipline discipline = null;
        if (disciplineKey != null) {
            discipline = sportDisciplineRepository.findByNameIgnoreCase(disciplineKey).orElse(null);
        }

        boolean needsSave = type.isNew();
        if (!Objects.equals(type.getLabel(), label)) {
            type.setLabel(label);
            needsSave = true;
        }
        if (discipline != null && (type.getDiscipline() == null || !Objects.equals(type.getDiscipline().getId(), discipline.getId()))) {
            type.setDiscipline(discipline);
            needsSave = true;
        }
        if (needsSave) {
            sportEquipmentTypeRepository.save(type);
        }
    }

    // ── Condition Seeding ───────────────────────────────────────────────

    private void seedConditions(JsonNode conditionsNode) {
        if (conditionsNode == null || !conditionsNode.isArray()) return;
        for (JsonNode node : conditionsNode) {
            String key = node.get("key").asText().trim().toUpperCase(Locale.ROOT);
            String label = node.get("label").asText().trim();
            upsertCondition(key, label);
        }
    }

    private void upsertCondition(String key, String label) {
        String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
        seenConditions.add(normalizedKey);
        Optional<SportCondition> existing = sportConditionRepository.findByNameIgnoreCase(normalizedKey);
        SportCondition condition;
        if (existing.isPresent()) {
            condition = existing.get();
            condition.setNew(false);
        } else {
            condition = new SportCondition();
            condition.setId(generateStableUuid("sport-condition:" + normalizedKey));
            condition.setName(normalizedKey);
        }
        if (!Objects.equals(condition.getLabel(), label)) {
            condition.setLabel(label);
            sportConditionRepository.save(condition);
        } else if (condition.isNew()) {
            sportConditionRepository.save(condition);
        }
    }
}
