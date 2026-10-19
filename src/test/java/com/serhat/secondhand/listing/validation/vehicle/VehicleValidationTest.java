package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.vehicle.VehicleDataInitializer;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleValidationTest {

    private MotorcycleValidator motorcycleValidator;
    private CommercialVehicleValidator commercialVehicleValidator;
    private VehicleDataInitializer vehicleDataInitializer;

    @BeforeEach
    void setUp() {
        motorcycleValidator = new MotorcycleValidator();
        commercialVehicleValidator = new CommercialVehicleValidator();
        vehicleDataInitializer = new VehicleDataInitializer(
                null, null, null, null, null, null, null, null, null
        );
    }

    private VehicleType createType(String name) {
        VehicleType type = new VehicleType();
        type.setId(UUID.randomUUID());
        type.setName(name);
        type.setLabel(name);
        return type;
    }

    @Nested
    @DisplayName("MotorcycleValidator cleanup & preservation tests")
    class MotorcycleTests {

        @Test
        void shouldPreserveBodyTypeAndHorsePowerOnCleanup() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(createType("MOTORCYCLE"))
                    .engineCapacity(600)
                    .fuelType(FuelType.GASOLINE)
                    .bodyType(BodyType.SPORTBIKE)
                    .horsePower(120)
                    .doors(Doors.TWO)
                    .seatCount(SeatCount.TWO)
                    .drivetrain(Drivetrain.RWD)
                    .build();

            motorcycleValidator.cleanup(listing);

            // Verified: bodyType and horsePower MUST NOT be erased!
            assertThat(listing.getBodyType()).isEqualTo(BodyType.SPORTBIKE);
            assertThat(listing.getHorsePower()).isEqualTo(120);

            // Irrelevant fields for motorcycles should be nulled out
            assertThat(listing.getDoors()).isNull();
            assertThat(listing.getSeatCount()).isNull();
            assertThat(listing.getDrivetrain()).isNull();

            Result<Void> result = motorcycleValidator.validate(listing);
            assertThat(result.isSuccess()).isTrue();
        }

        @Test
        void shouldRequireEngineCapacityAndFuelType() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(createType("MOTORCYCLE"))
                    .build();

            Result<Void> result = motorcycleValidator.validate(listing);
            assertThat(result.isError()).isTrue();
            assertThat(result.getErrorCode()).isEqualTo("MOTORCYCLE_ENGINE_CAPACITY_REQUIRED");

            listing.setEngineCapacity(250);
            result = motorcycleValidator.validate(listing);
            assertThat(result.isError()).isTrue();
            assertThat(result.getErrorCode()).isEqualTo("MOTORCYCLE_FUEL_TYPE_REQUIRED");
        }
    }

    @Nested
    @DisplayName("CommercialVehicleValidator tests")
    class CommercialVehicleTests {

        @Test
        void shouldValidateCommercialVehicleSuccessfully() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(createType("COMMERCIAL"))
                    .mileage(120000)
                    .fuelType(FuelType.DIESEL)
                    .gearbox(GearType.MANUAL)
                    .bodyType(BodyType.VAN)
                    .wheels(4)
                    .build();

            commercialVehicleValidator.cleanup(listing);
            Result<Void> result = commercialVehicleValidator.validate(listing);

            assertThat(result.isSuccess()).isTrue();
            assertThat(listing.getWheels()).isEqualTo(4);
        }

        @Test
        void shouldEnforceRequiredCommercialFields() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(createType("COMMERCIAL"))
                    .build();

            Result<Void> res = commercialVehicleValidator.validate(listing);
            assertThat(res.getErrorCode()).isEqualTo("COMMERCIAL_MILEAGE_REQUIRED");

            listing.setMileage(50000);
            res = commercialVehicleValidator.validate(listing);
            assertThat(res.getErrorCode()).isEqualTo("COMMERCIAL_FUEL_TYPE_REQUIRED");

            listing.setFuelType(FuelType.DIESEL);
            res = commercialVehicleValidator.validate(listing);
            assertThat(res.getErrorCode()).isEqualTo("COMMERCIAL_GEAR_TYPE_REQUIRED");

            listing.setGearbox(GearType.MANUAL);
            res = commercialVehicleValidator.validate(listing);
            assertThat(res.getErrorCode()).isEqualTo("COMMERCIAL_BODY_TYPE_REQUIRED");

            listing.setBodyType(BodyType.VAN);
            res = commercialVehicleValidator.validate(listing);
            assertThat(res.isSuccess()).isTrue();
        }

        @Test
        void shouldIgnoreNonCommercialListing() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(createType("CAR"))
                    .build();

            Result<Void> result = commercialVehicleValidator.validate(listing);
            assertThat(result.isSuccess()).isTrue();
        }
    }

    @Nested
    @DisplayName("VehicleDataInitializer label formatting tests")
    class LabelFormattingTests {

        @Test
        void shouldFormatKnownVehicleTypeLabelsInTurkish() {
            assertThat(vehicleDataInitializer.formatTypeLabel("CAR")).isEqualTo("Otomobil");
            assertThat(vehicleDataInitializer.formatTypeLabel("COMMERCIAL")).isEqualTo("Ticari Araçlar");
            assertThat(vehicleDataInitializer.formatTypeLabel("MOTORCYCLE")).isEqualTo("Motosiklet");
            assertThat(vehicleDataInitializer.formatTypeLabel("TRUCK")).isEqualTo("Kamyon / Çekici");
            assertThat(vehicleDataInitializer.formatTypeLabel("VAN")).isEqualTo("Minibüs / Panelvan");
            assertThat(vehicleDataInitializer.formatTypeLabel("BICYCLE")).isEqualTo("Bisiklet");
        }

        @Test
        void shouldFormatCustomTypeLabelsNicely() {
            assertThat(vehicleDataInitializer.formatTypeLabel("ELECTRIC_SCOOTER")).isEqualTo("Electric Scooter");
        }
    }

    @Nested
    @DisplayName("Vehicle spec parsing and catalog integrity tests")
    class CatalogSpecTests {

        @Test
        void shouldParseYearsFromNameCorrectly() {
            int[] openEnded = VehicleDataInitializer.parseYearsFromName("A1 Sportback (2018–, GB)");
            assertThat(openEnded).isNotNull();
            assertThat(openEnded[0]).isEqualTo(2018);
            assertThat(openEnded[1]).isEqualTo(-1);

            int[] bounded = VehicleDataInitializer.parseYearsFromName("A1 Sportback (2010–2018, 8X)");
            assertThat(bounded).isNotNull();
            assertThat(bounded[0]).isEqualTo(2010);
            assertThat(bounded[1]).isEqualTo(2018);
        }

        @Test
        void shouldParseEngineSpecsFromNameCorrectly() {
            int[] tdi = VehicleDataInitializer.parseEngineSpecsFromName("1.6 TDI 115");
            assertThat(tdi).isNotNull();
            assertThat(tdi[0]).isEqualTo(115); // hp
            assertThat(tdi[1]).isEqualTo(1600); // capacity

            int[] moto = VehicleDataInitializer.parseEngineSpecsFromName("999cc Inline-4 ShiftCam (205 hp)");
            assertThat(moto).isNotNull();
            assertThat(moto[0]).isEqualTo(205); // hp
            assertThat(moto[1]).isEqualTo(999); // capacity
        }

        @Test
        void allVehicleCatalogFiles_existAndParseCleanly() throws Exception {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            org.springframework.core.io.ClassPathResource brandsRes =
                    new org.springframework.core.io.ClassPathResource("data/vehicles/brands.json");
            assertThat(brandsRes.exists()).isTrue();

            com.fasterxml.jackson.databind.JsonNode root;
            try (java.io.InputStream is = brandsRes.getInputStream()) {
                root = mapper.readTree(is);
            }

            assertThat(root.size()).isGreaterThanOrEqualTo(70);

            java.util.Map<String, java.util.Set<String>> brandTypes = new java.util.HashMap<>();
            int totalModelsChecked = 0;

            for (com.fasterxml.jackson.databind.JsonNode brandNode : root) {
                String brand = brandNode.get("brand").asText();
                brandTypes.putIfAbsent(brand, new java.util.HashSet<>());

                com.fasterxml.jackson.databind.JsonNode supported = brandNode.get("supportedTypes");
                assertThat(supported).isNotNull();

                for (com.fasterxml.jackson.databind.JsonNode st : supported) {
                    String type = st.get("type").asText();
                    String dataFile = st.get("dataFile").asText();
                    brandTypes.get(brand).add(type);

                    org.springframework.core.io.ClassPathResource fileRes =
                            new org.springframework.core.io.ClassPathResource("data/vehicles/" + dataFile);
                    assertThat(fileRes.exists())
                            .as("Vehicle data file %s for brand %s must exist", dataFile, brand)
                            .isTrue();

                    try (java.io.InputStream fis = fileRes.getInputStream()) {
                        java.util.List<com.serhat.secondhand.listing.application.vehicle.dto.VehicleSeedModelDto> models =
                                mapper.readValue(fis, new com.fasterxml.jackson.core.type.TypeReference<>() {});
                        assertThat(models).as("Models in %s", dataFile).isNotEmpty();
                        for (var m : models) {
                            assertThat(m.getBrand()).isEqualTo(brand);
                            assertThat(m.getType()).isEqualTo(type);
                            assertThat(m.getName()).isNotBlank();
                            totalModelsChecked++;
                        }
                    }
                }
            }

            // Verify unified BMW and Suzuki
            assertThat(brandTypes.get("BMW")).contains("CAR", "MOTORCYCLE");
            assertThat(brandTypes.get("SUZUKI")).contains("CAR", "MOTORCYCLE");

            // Verify new brands
            assertThat(brandTypes).containsKey("TOGG");
            assertThat(brandTypes).containsKey("TESLA");
            assertThat(brandTypes).containsKey("CHERY");
            assertThat(brandTypes).containsKey("BYD");
            assertThat(brandTypes).containsKey("CUPRA");
            assertThat(brandTypes).containsKey("VESPA");
            assertThat(brandTypes).containsKey("CFMOTO");
            assertThat(brandTypes).containsKey("BAJAJ");
            assertThat(brandTypes).containsKey("TREK");
            assertThat(brandTypes).containsKey("CARRARO");

            assertThat(totalModelsChecked).isGreaterThan(500);
        }
    }
}
