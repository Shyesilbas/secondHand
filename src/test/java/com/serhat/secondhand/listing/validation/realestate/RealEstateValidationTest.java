package com.serhat.secondhand.listing.validation.realestate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateCategory;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RealEstateValidationTest {

    private RealEstateSpecCatalogService specCatalogService;
    private LandValidator landValidator;
    private HouseValidator houseValidator;
    private RealEstateSubtypeFieldPolicy subtypeFieldPolicy;

    private HeatingType combiHeating;

    @BeforeEach
    void setUp() {
        specCatalogService = new RealEstateSpecCatalogService(new ObjectMapper());
        specCatalogService.init();

        landValidator = new LandValidator();
        houseValidator = new HouseValidator();
        subtypeFieldPolicy = new RealEstateSubtypeFieldPolicy(specCatalogService);

        combiHeating = new HeatingType();
        combiHeating.setId(UUID.randomUUID());
        combiHeating.setName("COMBI_BOILER");
        combiHeating.setLabel("Kombi (Doğalgaz)");
    }

    private RealEstateType createType(String name) {
        RealEstateType type = new RealEstateType();
        type.setId(UUID.randomUUID());
        type.setName(name);
        type.setLabel(name);
        return type;
    }

    @Nested
    @DisplayName("RealEstateCategory mapping tests")
    class CategoryMappingTests {

        @Test
        void shouldCategorizeLandSubtypes() {
            assertThat(RealEstateCategory.fromTypeName("LAND")).isEqualTo(RealEstateCategory.LAND);
            assertThat(RealEstateCategory.fromTypeName("COMMERCIAL_LAND")).isEqualTo(RealEstateCategory.LAND);
            assertThat(RealEstateCategory.fromTypeName("FARM")).isEqualTo(RealEstateCategory.LAND);
            assertThat(RealEstateCategory.fromTypeName("VINEYARD")).isEqualTo(RealEstateCategory.LAND);
            assertThat(RealEstateCategory.fromTypeName("OLIVE_GROVE")).isEqualTo(RealEstateCategory.LAND);
        }

        @Test
        void shouldCategorizeResidentialSubtypes() {
            assertThat(RealEstateCategory.fromTypeName("APARTMENT")).isEqualTo(RealEstateCategory.RESIDENTIAL);
            assertThat(RealEstateCategory.fromTypeName("RESIDENCE")).isEqualTo(RealEstateCategory.RESIDENTIAL);
            assertThat(RealEstateCategory.fromTypeName("STUDIO")).isEqualTo(RealEstateCategory.RESIDENTIAL);
            assertThat(RealEstateCategory.fromTypeName("DUPLEX")).isEqualTo(RealEstateCategory.RESIDENTIAL);
            assertThat(RealEstateCategory.fromTypeName("VILLA")).isEqualTo(RealEstateCategory.RESIDENTIAL);
            assertThat(RealEstateCategory.fromTypeName("PREFABRICATED")).isEqualTo(RealEstateCategory.RESIDENTIAL);
        }

        @Test
        void shouldCategorizeCommercialSubtypes() {
            assertThat(RealEstateCategory.fromTypeName("OFFICE")).isEqualTo(RealEstateCategory.COMMERCIAL);
            assertThat(RealEstateCategory.fromTypeName("COMMERCIAL")).isEqualTo(RealEstateCategory.COMMERCIAL);
            assertThat(RealEstateCategory.fromTypeName("WAREHOUSE")).isEqualTo(RealEstateCategory.COMMERCIAL);
            assertThat(RealEstateCategory.fromTypeName("BUILDING")).isEqualTo(RealEstateCategory.COMMERCIAL);
        }

        @Test
        void shouldCategorizeOtherSubtypes() {
            assertThat(RealEstateCategory.fromTypeName("OTHER")).isEqualTo(RealEstateCategory.OTHER);
            assertThat(RealEstateCategory.fromTypeName(null)).isEqualTo(RealEstateCategory.OTHER);
            assertThat(RealEstateCategory.fromTypeName("")).isEqualTo(RealEstateCategory.OTHER);
        }
    }

    @Nested
    @DisplayName("COMMERCIAL_LAND (Audit item 4 core bug) tests")
    class CommercialLandTests {

        @Test
        void shouldValidateCommercialLandSuccessfully() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("COMMERCIAL_LAND"))
                    .squareMeters(1000)
                    .zoningStatus("COMMERCIAL_ZONED")
                    .zoningStatusKey("COMMERCIAL_ZONED")
                    .roomCount(0)
                    .build();

            // Run cleanup first
            landValidator.cleanup(listing);
            houseValidator.cleanup(listing);
            subtypeFieldPolicy.cleanup(listing);

            // Verify zoningStatus was preserved!
            assertThat(listing.getZoningStatus()).isEqualTo("COMMERCIAL_ZONED");
            assertThat(listing.getHeatingType()).isNull();
            assertThat(listing.getRoomCount()).isEqualTo(0);

            // Run validators
            Result<Void> landRes = landValidator.validate(listing);
            Result<Void> houseRes = houseValidator.validate(listing);
            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);

            assertThat(landRes.isSuccess()).isTrue();
            assertThat(houseRes.isSuccess()).isTrue();
            assertThat(policyRes.isSuccess()).isTrue();
        }

        @Test
        void shouldFailIfCommercialLandLacksZoningStatus() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("COMMERCIAL_LAND"))
                    .squareMeters(500)
                    .build();

            Result<Void> landRes = landValidator.validate(listing);
            assertThat(landRes.isError()).isTrue();
            assertThat(landRes.getErrorCode()).isEqualTo("LAND_ZONING_STATUS_REQUIRED");

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("SUBTYPE_ZONING_STATUS_REQUIRED");
        }

        @Test
        void shouldRejectResidentialParametersOnCommercialLand() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("COMMERCIAL_LAND"))
                    .squareMeters(500)
                    .zoningStatus("COMMERCIAL_ZONED")
                    .heatingType(combiHeating)
                    .build();

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("SUBTYPE_INCOMPATIBLE_HEATING");
        }

        @Test
        void shouldRejectInvalidZoningStatusKeyOnCommercialLand() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("COMMERCIAL_LAND"))
                    .squareMeters(500)
                    .zoningStatusKey("NON_EXISTING_STATUS")
                    .build();

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("INVALID_ZONING_STATUS_KEY");
        }
    }

    @Nested
    @DisplayName("Residential listing validation tests")
    class ResidentialTests {

        @Test
        void shouldValidateApartmentWithRoomCountSuccessfully() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("APARTMENT"))
                    .squareMeters(120)
                    .roomCount(3)
                    .heatingType(combiHeating)
                    .build();

            landValidator.cleanup(listing);
            houseValidator.cleanup(listing);
            subtypeFieldPolicy.cleanup(listing);

            assertThat(landValidator.validate(listing).isSuccess()).isTrue();
            assertThat(houseValidator.validate(listing).isSuccess()).isTrue();
            assertThat(subtypeFieldPolicy.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void shouldValidatePrefabricatedWithRoomConfigKeySuccessfully() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("PREFABRICATED"))
                    .squareMeters(90)
                    .roomConfigKey("ROOM_2_1")
                    .heatingType(combiHeating)
                    .build();

            landValidator.cleanup(listing);
            houseValidator.cleanup(listing);
            subtypeFieldPolicy.cleanup(listing);

            // Verify roomCount was populated from roomConfigKey
            assertThat(listing.getRoomCount()).isEqualTo(2);

            assertThat(landValidator.validate(listing).isSuccess()).isTrue();
            assertThat(houseValidator.validate(listing).isSuccess()).isTrue();
            assertThat(subtypeFieldPolicy.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void shouldFailIfResidentialLacksHeatingType() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("APARTMENT"))
                    .squareMeters(100)
                    .roomCount(3)
                    .build();

            Result<Void> houseRes = houseValidator.validate(listing);
            assertThat(houseRes.isError()).isTrue();
            assertThat(houseRes.getErrorCode()).isEqualTo("REAL_ESTATE_HEATING_TYPE_REQUIRED");
        }

        @Test
        void shouldFailIfResidentialHasZoningStatusKey() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("VILLA"))
                    .squareMeters(250)
                    .roomCount(5)
                    .heatingType(combiHeating)
                    .zoningStatusKey("RESIDENTIAL_ZONED")
                    .build();

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("SUBTYPE_INCOMPATIBLE_ZONING");
        }

        @Test
        void shouldFailIfResidentialHasInvalidRoomConfigKey() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("DUPLEX"))
                    .squareMeters(180)
                    .heatingType(combiHeating)
                    .roomConfigKey("ROOM_INVALID_100")
                    .build();

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("INVALID_ROOM_CONFIG_KEY");
        }
    }

    @Nested
    @DisplayName("Commercial listing validation tests")
    class CommercialTests {

        @Test
        void shouldValidateOfficeSuccessfully() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("OFFICE"))
                    .squareMeters(85)
                    .roomCount(2)
                    .heatingType(combiHeating)
                    .build();

            landValidator.cleanup(listing);
            houseValidator.cleanup(listing);
            subtypeFieldPolicy.cleanup(listing);

            assertThat(landValidator.validate(listing).isSuccess()).isTrue();
            assertThat(houseValidator.validate(listing).isSuccess()).isTrue();
            assertThat(subtypeFieldPolicy.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void shouldValidateBuildingSuccessfully() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("BUILDING"))
                    .squareMeters(1200)
                    .roomCount(20)
                    .heatingType(combiHeating)
                    .build();

            landValidator.cleanup(listing);
            houseValidator.cleanup(listing);
            subtypeFieldPolicy.cleanup(listing);

            assertThat(landValidator.validate(listing).isSuccess()).isTrue();
            assertThat(houseValidator.validate(listing).isSuccess()).isTrue();
            assertThat(subtypeFieldPolicy.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void shouldFailIfCommercialHasZoningStatusKey() {
            RealEstateListing listing = RealEstateListing.builder()
                    .realEstateType(createType("WAREHOUSE"))
                    .squareMeters(500)
                    .roomCount(1)
                    .heatingType(combiHeating)
                    .zoningStatusKey("COMMERCIAL_ZONED")
                    .build();

            Result<Void> policyRes = subtypeFieldPolicy.validate(listing);
            assertThat(policyRes.isError()).isTrue();
            assertThat(policyRes.getErrorCode()).isEqualTo("SUBTYPE_INCOMPATIBLE_ZONING");
        }
    }

    @Nested
    @DisplayName("RealEstateSpecCatalogService expanded specs tests")
    class SpecCatalogServiceTests {

        @Test
        void shouldRecognizeAllExpandedRoomConfigs() {
            assertThat(specCatalogService.isValidRoomConfig("ROOM_1_0")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_1_1")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_1_5_1")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_2_0")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_2_2")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_3_0")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_3_2")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_4_0")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_5_1")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_5_2")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_6_1")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_6_2")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_7_1")).isTrue();
            assertThat(specCatalogService.isValidRoomConfig("ROOM_8_PLUS")).isTrue();

            assertThat(specCatalogService.isValidRoomConfig("UNKNOWN_ROOM")).isFalse();
        }

        @Test
        void shouldRecognizeAllExpandedZoningStatuses() {
            assertThat(specCatalogService.isValidZoningStatus("RESIDENTIAL_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("COMMERCIAL_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("INDUSTRIAL_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("TOURISM_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("MIXED_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("AGRICULTURAL")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("VINEYARD_GARDEN")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("OLIVE_GROVE")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("PROTECTED_AREA")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("PUBLIC_ZONED")).isTrue();
            assertThat(specCatalogService.isValidZoningStatus("UNZONED")).isTrue();

            assertThat(specCatalogService.isValidZoningStatus("UNKNOWN_ZONING")).isFalse();
        }
    }
}
