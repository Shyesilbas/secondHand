package com.serhat.secondhand.listing.application.electronics;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicSeedModelDto;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ElectronicDataInitializerTest {

    @Mock
    private ElectronicBrandRepository brandRepository;

    @Mock
    private ElectronicTypeRepository typeRepository;

    @Mock
    private ElectronicModelRepository modelRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ElectronicDataInitializer initializer;

    @BeforeEach
    void setUp() {
        initializer = new ElectronicDataInitializer(brandRepository, typeRepository, modelRepository, objectMapper);
    }

    @Test
    void formatTypeLabel_translatesWashingMachineCorrectly() {
        assertThat(initializer.formatTypeLabel("WASHING_MACHINE")).isEqualTo("Çamaşır Makinesi");
    }

    @Test
    void allTypesInBrandsJson_haveValidTurkishLabels() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/electronics/brands.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        Set<String> uniqueTypes = new HashSet<>();
        for (JsonNode brand : root) {
            JsonNode supported = brand.get("supportedTypes");
            if (supported != null && supported.isArray()) {
                for (JsonNode st : supported) {
                    uniqueTypes.add(st.get("type").asText());
                }
            }
        }

        assertThat(uniqueTypes).contains("WASHING_MACHINE", "MOBILE_PHONE", "LAPTOP", "ROBOT_VACUUM", "AIR_CONDITIONER");

        for (String type : uniqueTypes) {
            String label = initializer.formatTypeLabel(type);
            assertThat(label)
                    .as("Label for electronic type " + type)
                    .isNotBlank()
                    .doesNotContain("_");
        }
    }

    @Test
    void ensureModel_persistsMetadataOnNewModel() {
        ElectronicBrand brand = new ElectronicBrand();
        brand.setId(UUID.randomUUID());
        brand.setName("APPLE");

        ElectronicType type = new ElectronicType();
        type.setId(UUID.randomUUID());
        type.setName("MOBILE_PHONE");

        when(brandRepository.findByNameIgnoreCase("APPLE")).thenReturn(Optional.of(brand));
        when(typeRepository.findByNameIgnoreCase("MOBILE_PHONE")).thenReturn(Optional.of(type));
        when(modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(any(), any(), eq("iPhone 15 Pro")))
                .thenReturn(Optional.empty());

        ElectronicSeedModelDto dto = new ElectronicSeedModelDto();
        dto.setBrand("APPLE");
        dto.setType("MOBILE_PHONE");
        dto.setName("iPhone 15 Pro");
        dto.setReleaseYear(2023);
        dto.setIsLegacy(false);
        dto.setAliases(List.of("15 Pro", "A3102"));

        initializer.formatTypeLabel("MOBILE_PHONE"); // verify accessible

        // Use reflection to invoke ensureModel or run via full flow
        org.springframework.test.util.ReflectionTestUtils.invokeMethod(
                initializer, "ensureModel", "APPLE", "MOBILE_PHONE", dto);

        ArgumentCaptor<ElectronicModel> captor = ArgumentCaptor.forClass(ElectronicModel.class);
        verify(modelRepository).save(captor.capture());

        ElectronicModel saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("iPhone 15 Pro");
        assertThat(saved.getReleaseYear()).isEqualTo(2023);
        assertThat(saved.getIsLegacy()).isFalse();
        assertThat(saved.getAliases()).containsExactly("15 Pro", "A3102");
    }

    @Test
    void ensureModel_updatesMetadataOnExistingModel() {
        ElectronicBrand brand = new ElectronicBrand();
        brand.setId(UUID.randomUUID());
        brand.setName("SONY");

        ElectronicType type = new ElectronicType();
        type.setId(UUID.randomUUID());
        type.setName("GAME_CONSOLE");

        ElectronicModel existing = new ElectronicModel();
        existing.setId(UUID.randomUUID());
        existing.setName("PlayStation 5");
        existing.setBrand(brand);
        existing.setType(type);
        existing.setReleaseYear(null);
        existing.setIsLegacy(null);
        existing.setAliases(new ArrayList<>());

        when(brandRepository.findByNameIgnoreCase("SONY")).thenReturn(Optional.of(brand));
        when(typeRepository.findByNameIgnoreCase("GAME_CONSOLE")).thenReturn(Optional.of(type));
        when(modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(any(), any(), eq("PlayStation 5")))
                .thenReturn(Optional.of(existing));

        ElectronicSeedModelDto dto = new ElectronicSeedModelDto();
        dto.setBrand("SONY");
        dto.setType("GAME_CONSOLE");
        dto.setName("PlayStation 5");
        dto.setReleaseYear(2020);
        dto.setIsLegacy(false);
        dto.setAliases(List.of("PS5", "PlayStation 5 Disc"));

        org.springframework.test.util.ReflectionTestUtils.invokeMethod(
                initializer, "ensureModel", "SONY", "GAME_CONSOLE", dto);

        ArgumentCaptor<ElectronicModel> captor = ArgumentCaptor.forClass(ElectronicModel.class);
        verify(modelRepository).save(captor.capture());

        ElectronicModel updated = captor.getValue();
        assertThat(updated.getReleaseYear()).isEqualTo(2020);
        assertThat(updated.getIsLegacy()).isFalse();
        assertThat(updated.getAliases()).containsExactly("PS5", "PlayStation 5 Disc");
    }

    @Test
    void allBrandDataFiles_existAndParseCleanly() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/electronics/brands.json");
        assertThat(resource.exists()).isTrue();

        JsonNode root;
        try (InputStream is = resource.getInputStream()) {
            root = objectMapper.readTree(is);
        }

        assertThat(root.size()).isGreaterThanOrEqualTo(80);

        int totalModelsChecked = 0;
        Set<String> brands = new HashSet<>();

        for (JsonNode brandNode : root) {
            String brandKey = brandNode.get("brand").asText();
            brands.add(brandKey);
            JsonNode supportedTypes = brandNode.get("supportedTypes");
            if (supportedTypes == null || !supportedTypes.isArray()) continue;

            for (JsonNode st : supportedTypes) {
                String type = st.get("type").asText();
                String dataFile = st.get("dataFile").asText();

                ClassPathResource fileRes = new ClassPathResource("data/electronics/" + dataFile);
                assertThat(fileRes.exists())
                        .as("File for brand %s type %s must exist: %s", brandKey, type, dataFile)
                        .isTrue();

                try (InputStream fis = fileRes.getInputStream()) {
                    List<ElectronicSeedModelDto> models = objectMapper.readValue(
                            fis,
                            new com.fasterxml.jackson.core.type.TypeReference<List<ElectronicSeedModelDto>>() {}
                    );
                    assertThat(models).as("Models in %s", dataFile).isNotEmpty();
                    for (ElectronicSeedModelDto m : models) {
                        assertThat(m.getName()).as("Model name in %s", dataFile).isNotBlank();
                        assertThat(m.getBrand()).as("Brand in %s", dataFile).isEqualTo(brandKey);
                        assertThat(m.getType()).as("Type in %s", dataFile).isEqualTo(type);
                        totalModelsChecked++;
                    }
                }
            }
        }

        assertThat(brands).contains("MICROSOFT", "NINTENDO", "VALVE", "CANON", "NIKON", "FUJIFILM",
                "GOPRO", "DJI", "LOGITECH", "RAZER", "ROBOROCK", "DREAME", "DYSON",
                "JBL", "BOSE", "MSI", "ACER", "MONSTER", "HONOR", "OPPO", "OTHER");
        assertThat(totalModelsChecked).isGreaterThan(1600);
    }
}
