package com.serhat.secondhand.listing.application.electronics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicSeedModelDto;
import com.serhat.secondhand.listing.application.electronics.dto.ElectronicTypeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ElectronicDataInitializerTest {

    @Mock
    private ElectronicBrandRepository brandRepository;
    @Mock
    private ElectronicTypeRepository typeRepository;
    @Mock
    private ElectronicModelRepository modelRepository;
    @Mock
    private ElectronicModelVariantRepository variantRepository;

    // Strict on unknown properties, so a typo in a seed file fails here.
    private final ObjectMapper objectMapper = new ObjectMapper();
    private ElectronicDataInitializer initializer;
    private ElectronicBrand brand;
    private ElectronicType type;

    @BeforeEach
    void setUp() {
        initializer = new ElectronicDataInitializer(brandRepository, typeRepository, modelRepository,
                variantRepository, objectMapper);
        brand = new ElectronicBrand();
        brand.setId(UUID.randomUUID());
        brand.setName("APPLE");
        type = new ElectronicType();
        type.setId(UUID.randomUUID());
        type.setName("MOBILE_PHONE");
        when(modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(any(), any(), any())).thenReturn(Optional.empty());
        when(modelRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(variantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void typesJson_namesEveryFieldAndCoversEveryBrandType() throws Exception {
        Map<String, ElectronicTypeDefinitionDto> types = initializer.loadTypeDefinitions();
        assertThat(types).hasSize(19);
        assertThat(types.get("MOBILE_PHONE").getLabel()).isEqualTo("Cep Telefonu");
        types.values().forEach(t -> assertThat(t.getLabel()).doesNotContain("_"));

        JsonNode brands = readTree("data/electronics/brands.json");
        Set<String> used = new HashSet<>();
        brands.forEach(b -> b.get("supportedTypes").forEach(st -> used.add(st.get("type").asText())));
        assertThat(types.keySet()).containsAll(used);
    }

    @Test
    void everyModelFile_passesTheSeedChecks() throws Exception {
        int models = 0;
        int withFacts = 0;
        for (JsonNode b : readTree("data/electronics/brands.json")) {
            for (JsonNode st : b.get("supportedTypes")) {
                String file = st.get("dataFile").asText();
                List<ElectronicSeedModelDto> dtos;
                try (InputStream is = new ClassPathResource("data/electronics/" + file).getInputStream()) {
                    dtos = objectMapper.readValue(is, new TypeReference<>() {});
                }
                for (ElectronicSeedModelDto dto : dtos) {
                    String where = file + " / " + dto.getName();
                    ElectronicModel model = initializer.upsertModel(brand, type, dto, where);
                    ReflectionTestUtils.invokeMethod(initializer, "seedVariants", model, dto, List.of(), where);
                    models++;
                    if (dto.getSource() != null) withFacts++;
                }
            }
        }
        assertThat(models).isGreaterThan(1500);
        assertThat(withFacts).isGreaterThan(0);
    }

    @Test
    void upsertModel_storesSpecsColorsAndVariants() {
        ElectronicSeedModelDto dto = phoneDto();
        ElectronicModel model = initializer.upsertModel(brand, type, dto, "test");

        assertThat(model.getSpecs()).containsEntry("batteryCapacityMah", 3582).containsEntry("supports5g", true);
        assertThat(model.getColors()).singleElement()
                .satisfies(c -> assertThat(c.getColor()).isEqualTo(Color.BLACK));
        assertThat(model.getSource()).isEqualTo("claude-draft");

        ReflectionTestUtils.invokeMethod(initializer, "seedVariants", model, dto, List.of(), "test");
        ArgumentCaptor<ElectronicModelVariant> captor = ArgumentCaptor.forClass(ElectronicModelVariant.class);
        org.mockito.Mockito.verify(variantRepository).save(captor.capture());
        assertThat(captor.getValue().getStorage()).isEqualTo(256);
        assertThat(captor.getValue().getSource()).isEqualTo("claude-draft");
    }

    @Test
    void upsertModel_rejectsUnknownSpecKey() {
        ElectronicSeedModelDto dto = phoneDto();
        dto.setSpecs(Map.of("batteryMah", 3582));
        assertThatThrownBy(() -> initializer.upsertModel(brand, type, dto, "x"))
                .hasMessageContaining("unknown spec key 'batteryMah'");
    }

    @Test
    void upsertModel_rejectsFactsWithoutSource() {
        ElectronicSeedModelDto dto = phoneDto();
        dto.setSource(null);
        assertThatThrownBy(() -> initializer.upsertModel(brand, type, dto, "x"))
                .hasMessageContaining("source must be one of");
    }

    @Test
    void upsertModel_rejectsUnknownColor() {
        ElectronicSeedModelDto dto = phoneDto();
        dto.getColors().get(0).setColor("SPACE_BLACK");
        assertThatThrownBy(() -> initializer.upsertModel(brand, type, dto, "x"))
                .hasMessageContaining("unknown color 'SPACE_BLACK'");
    }

    @Test
    void seedVariants_rejectsVariantColumnInSpecs() {
        ElectronicSeedModelDto dto = phoneDto();
        dto.getVariants().get(0).setSpecs(Map.of("storage", 256));
        ElectronicModel model = initializer.upsertModel(brand, type, dto, "x");
        assertThatThrownBy(() -> ReflectionTestUtils.invokeMethod(initializer, "seedVariants", model, dto, List.of(), "x"))
                .hasMessageContaining("is a variant column");
    }

    private static ElectronicSeedModelDto phoneDto() {
        ElectronicSeedModelDto dto = new ElectronicSeedModelDto();
        dto.setName("iPhone 16 Pro");
        dto.setReleaseYear(2024);
        dto.setSource("claude-draft");
        dto.setSpecs(new java.util.LinkedHashMap<>(Map.of("batteryCapacityMah", 3582, "supports5g", true)));
        ElectronicSeedModelDto.Color color = new ElectronicSeedModelDto.Color();
        color.setName("Siyah Titanyum");
        color.setColor("BLACK");
        dto.setColors(new java.util.ArrayList<>(List.of(color)));
        ElectronicSeedModelDto.Variant variant = new ElectronicSeedModelDto.Variant();
        variant.setName("256 GB");
        variant.setStorage(256);
        variant.setRam(8);
        dto.setVariants(new java.util.ArrayList<>(List.of(variant)));
        return dto;
    }

    private JsonNode readTree(String path) throws Exception {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readTree(is);
        }
    }
}
