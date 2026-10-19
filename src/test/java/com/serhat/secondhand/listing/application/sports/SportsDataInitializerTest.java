package com.serhat.secondhand.listing.application.sports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import com.serhat.secondhand.listing.validation.sports.SportsRequiredFieldsValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SportsDataInitializerTest {

    @Mock
    private SportDisciplineRepository sportDisciplineRepository;

    @Mock
    private SportEquipmentTypeRepository sportEquipmentTypeRepository;

    @Mock
    private SportConditionRepository sportConditionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void everyDisciplineInCatalog_hasMatchingEquipmentTypes() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/sports/sports.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        JsonNode disciplinesNode = root.get("disciplines");
        JsonNode equipmentTypesNode = root.get("equipmentTypes");

        assertThat(disciplinesNode).isNotNull();
        assertThat(equipmentTypesNode).isNotNull();

        List<String> equipmentKeys = new ArrayList<>();
        for (JsonNode eq : equipmentTypesNode) {
            equipmentKeys.add(eq.get("key").asText().toUpperCase(Locale.ROOT));
        }

        List<String> uncoveredDisciplines = new ArrayList<>();
        for (JsonNode disc : disciplinesNode) {
            String discKey = disc.get("key").asText().toUpperCase(Locale.ROOT);
            boolean hasMatch = equipmentKeys.stream().anyMatch(eqKey ->
                    eqKey.startsWith(discKey + "_") || (discKey.equals("OTHER") && eqKey.equals("OTHER_EQUIPMENT"))
            );
            if (!hasMatch) {
                uncoveredDisciplines.add(discKey);
            }
        }

        assertThat(uncoveredDisciplines)
                .as("All sports disciplines in sports.json must have corresponding equipment types")
                .isEmpty();
    }

    @Test
    void sportsRequiredFieldsValidator_validatesRequiredFields() {
        SportsRequiredFieldsValidator validator = new SportsRequiredFieldsValidator();

        assertThat(validator.validate(null).isError()).isTrue();

        SportsListing listing = new SportsListing();
        assertThat(validator.validate(listing).isError()).isTrue();
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("SPORT_DISCIPLINE_REQUIRED");

        SportDiscipline discipline = new SportDiscipline();
        discipline.setName("RUNNING");
        listing.setDiscipline(discipline);
        assertThat(validator.validate(listing).isError()).isTrue();
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("SPORT_EQUIPMENT_TYPE_REQUIRED");

        SportEquipmentType eqType = new SportEquipmentType();
        eqType.setName("RUNNING_SHOES");
        listing.setEquipmentType(eqType);
        assertThat(validator.validate(listing).isError()).isTrue();
        assertThat(validator.validate(listing).getErrorCode()).isEqualTo("SPORT_CONDITION_REQUIRED");

        SportCondition condition = new SportCondition();
        condition.setName("NEW");
        listing.setCondition(condition);

        Result<Void> validResult = validator.validate(listing);
        assertThat(validResult.isSuccess()).isTrue();
    }

    @Test
    void run_seedsAllDisciplinesAndEquipmentSuccessfully() {
        SportsDataInitializer initializer = new SportsDataInitializer(
                sportDisciplineRepository,
                sportEquipmentTypeRepository,
                sportConditionRepository,
                objectMapper
        );

        when(sportDisciplineRepository.findByNameIgnoreCase(any())).thenReturn(Optional.empty());
        when(sportEquipmentTypeRepository.findByNameIgnoreCase(any())).thenReturn(Optional.empty());
        when(sportConditionRepository.findByNameIgnoreCase(any())).thenReturn(Optional.empty());

        Result<Void> result = initializer.run();

        assertThat(result.isSuccess()).isTrue();
        verify(sportDisciplineRepository, atLeast(29)).save(any());
        verify(sportEquipmentTypeRepository, atLeast(80)).save(any());
        verify(sportConditionRepository, atLeast(5)).save(any());
    }
}
