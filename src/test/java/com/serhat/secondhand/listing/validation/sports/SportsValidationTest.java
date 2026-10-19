package com.serhat.secondhand.listing.validation.sports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SportsValidationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SportsHierarchyValidator hierarchyValidator = new SportsHierarchyValidator();
    private final SportsRequiredFieldsValidator requiredFieldsValidator = new SportsRequiredFieldsValidator();

    @Test
    @DisplayName("sports.json catalog has all 29 disciplines, rich equipment types, and valid Turkish labels")
    void testSportsCatalogStructure() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/sports/sports.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        // 1. Disciplines
        JsonNode disciplines = root.get("disciplines");
        assertThat(disciplines).isNotNull();
        assertThat(disciplines.isArray()).isTrue();
        assertThat(disciplines.size()).isEqualTo(29);

        Set<String> disciplineKeys = new HashSet<>();
        for (JsonNode disc : disciplines) {
            assertThat(disc.has("key")).isTrue();
            assertThat(disc.has("label")).isTrue();
            String key = disc.get("key").asText();
            String label = disc.get("label").asText();
            assertThat(key).matches("^[A-Z0-9_]+$");
            assertThat(label).isNotBlank();
            disciplineKeys.add(key);
        }

        // Check the 11 audited disciplines
        assertThat(disciplineKeys).contains(
                "RUNNING", "WALKING", "CYCLING", "SWIMMING", "BOXING",
                "MARTIAL_ARTS", "TREKKING", "BADMINTON", "GOLF", "CLIMBING", "SURFING"
        );

        // 2. Equipment Types
        JsonNode equipmentTypes = root.get("equipmentTypes");
        assertThat(equipmentTypes).isNotNull();
        assertThat(equipmentTypes.isArray()).isTrue();
        assertThat(equipmentTypes.size()).isGreaterThanOrEqualTo(90);

        Set<String> coveredDisciplines = new HashSet<>();
        for (JsonNode eq : equipmentTypes) {
            assertThat(eq.has("key")).isTrue();
            assertThat(eq.has("label")).isTrue();
            assertThat(eq.has("discipline")).isTrue();

            String key = eq.get("key").asText();
            String label = eq.get("label").asText();
            String discipline = eq.get("discipline").asText();

            assertThat(key).matches("^[A-Z0-9_]+$");
            assertThat(label).isNotBlank();
            // Verify specific overly-narrow phrases are cleaned up
            assertThat(label).doesNotContain("(3-Pack)", "(6-Pack)", "65L Outdoor Backpack", "Hex Dumbbell Set");

            assertThat(disciplineKeys).as("Equipment discipline %s must exist in disciplines", discipline).contains(discipline);
            coveredDisciplines.add(discipline);
        }

        // All 29 disciplines must have at least one equipment type
        assertThat(coveredDisciplines).containsAll(disciplineKeys);

        // 3. Conditions
        JsonNode conditions = root.get("conditions");
        assertThat(conditions).isNotNull();
        assertThat(conditions.isArray()).isTrue();
        assertThat(conditions.size()).isEqualTo(5);
        for (JsonNode cond : conditions) {
            assertThat(cond.has("key")).isTrue();
            assertThat(cond.has("label")).isTrue();
            assertThat(cond.get("key").asText()).matches("^[A-Z0-9_]+$");
            assertThat(cond.get("label").asText()).isNotBlank();
        }
    }

    @Test
    @DisplayName("SportsHierarchyValidator succeeds when equipment matches discipline")
    void testHierarchyValidator_Success() {
        SportDiscipline football = new SportDiscipline();
        football.setId(UUID.nameUUIDFromBytes("sport-discipline:FOOTBALL".getBytes(StandardCharsets.UTF_8)));
        football.setName("FOOTBALL");

        SportEquipmentType cleats = new SportEquipmentType();
        cleats.setId(UUID.nameUUIDFromBytes("sport-equipment-type:FOOTBALL_CLEATS".getBytes(StandardCharsets.UTF_8)));
        cleats.setName("FOOTBALL_CLEATS");
        cleats.setDiscipline(football);

        SportsListing listing = new SportsListing();
        listing.setDiscipline(football);
        listing.setEquipmentType(cleats);

        Result<Void> result = hierarchyValidator.validate(listing);
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    @DisplayName("SportsHierarchyValidator fails when equipment does not belong to selected discipline")
    void testHierarchyValidator_FailureOnMismatch() {
        SportDiscipline football = new SportDiscipline();
        football.setId(UUID.randomUUID());
        football.setName("FOOTBALL");

        SportDiscipline tennis = new SportDiscipline();
        tennis.setId(UUID.randomUUID());
        tennis.setName("TENNIS");

        SportEquipmentType racket = new SportEquipmentType();
        racket.setId(UUID.randomUUID());
        racket.setName("TENNIS_RACKET");
        racket.setDiscipline(tennis);

        SportsListing listing = new SportsListing();
        listing.setDiscipline(football);
        listing.setEquipmentType(racket);

        Result<Void> result = hierarchyValidator.validate(listing);
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("SPORT_EQUIPMENT_DISCIPLINE_MISMATCH");
    }

    @Test
    @DisplayName("SportsHierarchyValidator allows OTHER_EQUIPMENT for any discipline")
    void testHierarchyValidator_AllowsOtherEquipment() {
        SportDiscipline golf = new SportDiscipline();
        golf.setId(UUID.randomUUID());
        golf.setName("GOLF");

        SportEquipmentType other = new SportEquipmentType();
        other.setId(UUID.randomUUID());
        other.setName("OTHER_EQUIPMENT");

        SportsListing listing = new SportsListing();
        listing.setDiscipline(golf);
        listing.setEquipmentType(other);

        Result<Void> result = hierarchyValidator.validate(listing);
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    @DisplayName("SportsRequiredFieldsValidator validates required fields")
    void testRequiredFieldsValidator() {
        SportsListing listing = new SportsListing();
        Result<Void> res1 = requiredFieldsValidator.validate(listing);
        assertThat(res1.getErrorCode()).isEqualTo("SPORT_DISCIPLINE_REQUIRED");

        SportDiscipline discipline = new SportDiscipline();
        discipline.setId(UUID.randomUUID());
        listing.setDiscipline(discipline);

        Result<Void> res2 = requiredFieldsValidator.validate(listing);
        assertThat(res2.getErrorCode()).isEqualTo("SPORT_EQUIPMENT_TYPE_REQUIRED");

        SportEquipmentType type = new SportEquipmentType();
        type.setId(UUID.randomUUID());
        listing.setEquipmentType(type);

        Result<Void> res3 = requiredFieldsValidator.validate(listing);
        assertThat(res3.getErrorCode()).isEqualTo("SPORT_CONDITION_REQUIRED");

        SportCondition condition = new SportCondition();
        condition.setId(UUID.randomUUID());
        listing.setCondition(condition);

        Result<Void> res4 = requiredFieldsValidator.validate(listing);
        assertThat(res4.isSuccess()).isTrue();
    }

    @Test
    @DisplayName("Sports entities implement Persistable<UUID> with deterministic UUID and isNew flag")
    void testPersistableImplementation() {
        UUID stableId = UUID.nameUUIDFromBytes("sport-discipline:BASKETBALL".getBytes(StandardCharsets.UTF_8));
        SportDiscipline disc = new SportDiscipline();
        disc.setId(stableId);
        assertThat(disc.isNew()).isTrue();
        disc.setNew(false);
        assertThat(disc.isNew()).isFalse();
        assertThat(disc.getId()).isEqualTo(stableId);
    }
}
