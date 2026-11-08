package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.vehicle.VehicleDataInitializer;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleValidationTest {

    private final VehicleTypeRulesValidator rulesValidator = new VehicleTypeRulesValidator();

    private VehicleType createType(String name) {
        VehicleType type = new VehicleType();
        type.setId(UUID.randomUUID());
        type.setName(name);
        type.setLabel(name);
        return type;
    }

    /** A type whose rules mirror data/vehicles/types.json for the given type. */
    private VehicleType typeWithRules(String name, List<BodyType> bodyTypes, List<String> required, List<String> hidden) {
        VehicleType type = createType(name);
        type.setBodyTypes(new ArrayList<>(bodyTypes));
        Map<String, SpecFieldRule> rules = new LinkedHashMap<>();
        VehicleSpecFields.ALL.keySet().forEach(field -> rules.put(field,
                required.contains(field) ? SpecFieldRule.REQUIRED
                        : hidden.contains(field) ? SpecFieldRule.HIDDEN : SpecFieldRule.OPTIONAL));
        type.setFieldRules(rules);
        return type;
    }

    private VehicleType motorcycle() {
        return typeWithRules("MOTORCYCLE", List.of(BodyType.SPORTBIKE, BodyType.NAKED),
                List.of("engineCapacity", "fuelType", "bodyType"),
                List.of("doors", "seatCount", "drivetrain", "fuelCapacity", "fuelConsumption",
                        "kilometersPerLiter", "inspectionValidUntil"));
    }

    private VehicleType commercial() {
        return typeWithRules("COMMERCIAL", List.of(BodyType.VAN, BodyType.PICKUP),
                List.of("mileage", "fuelType", "gearbox", "bodyType"), List.of());
    }

    @Nested
    @DisplayName("VehicleTypeRulesValidator")
    class TypeRulesTests {

        @Test
        void clearsHiddenFieldsAndKeepsTheRest() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(motorcycle())
                    .engineCapacity(600)
                    .fuelType(FuelType.GASOLINE)
                    .bodyType(BodyType.SPORTBIKE)
                    .horsePower(120)
                    .doors(Doors.TWO)
                    .seatCount(SeatCount.TWO)
                    .drivetrain(Drivetrain.RWD)
                    .build();

            rulesValidator.cleanup(listing);

            assertThat(listing.getBodyType()).isEqualTo(BodyType.SPORTBIKE);
            assertThat(listing.getHorsePower()).isEqualTo(120);
            assertThat(listing.getDoors()).isNull();
            assertThat(listing.getSeatCount()).isNull();
            assertThat(listing.getDrivetrain()).isNull();
            assertThat(rulesValidator.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void requiresTheTypesRequiredFieldsInOrder() {
            VehicleListing listing = VehicleListing.builder().vehicleType(commercial()).build();

            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_MILEAGE_REQUIRED");
            listing.setMileage(0);
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_FUEL_TYPE_REQUIRED");
            listing.setFuelType(FuelType.DIESEL);
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_GEAR_TYPE_REQUIRED");
            listing.setGearbox(GearType.MANUAL);
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_BODY_TYPE_REQUIRED");
            listing.setBodyType(BodyType.VAN);
            assertThat(rulesValidator.validate(listing).isSuccess()).isTrue();
        }

        @Test
        void rejectsNonPositiveRequiredEngineCapacity() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(motorcycle()).engineCapacity(0).fuelType(FuelType.GASOLINE).bodyType(BodyType.NAKED)
                    .build();
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_ENGINE_CAPACITY_REQUIRED");
        }

        @Test
        void rejectsBodyTypeTheTypeDoesNotAllow() {
            VehicleListing listing = VehicleListing.builder()
                    .vehicleType(commercial()).mileage(1000).fuelType(FuelType.DIESEL).gearbox(GearType.MANUAL)
                    .bodyType(BodyType.SEDAN)
                    .build();
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_BODY_TYPE_NOT_ALLOWED");
        }

        @Test
        void failsClearlyWhenTheTypeHasNoRules() {
            VehicleListing listing = VehicleListing.builder().vehicleType(createType("CAR")).build();
            assertThat(rulesValidator.validate(listing).getErrorCode()).isEqualTo("VEHICLE_TYPE_RULES_MISSING");
        }

        @Test
        void clearsNonPositiveWheels() {
            VehicleListing listing = VehicleListing.builder().vehicleType(commercial()).wheels(0).build();
            rulesValidator.cleanup(listing);
            assertThat(listing.getWheels()).isNull();
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

            assertThat(root.size()).isGreaterThanOrEqualTo(60);

            // Every type brands.json uses is defined in types.json; model body types are allowed by their type.
            java.util.Map<String, java.util.Set<String>> typeBodies = new java.util.HashMap<>();
            try (java.io.InputStream is = new org.springframework.core.io.ClassPathResource("data/vehicles/types.json").getInputStream()) {
                for (com.fasterxml.jackson.databind.JsonNode t : mapper.readTree(is)) {
                    java.util.Set<String> bodies = new java.util.HashSet<>();
                    t.get("bodyTypes").forEach(b -> bodies.add(b.asText()));
                    typeBodies.put(t.get("type").asText(), bodies);
                    assertThat(t.get("fields").size()).isEqualTo(VehicleSpecFields.ALL.size());
                }
            }
            assertThat(typeBodies.keySet()).containsExactlyInAnyOrder("CAR", "COMMERCIAL", "TRUCK", "MOTORCYCLE");

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
                            if (m.getSupportedBodyTypes() != null) {
                                assertThat(typeBodies.get(type))
                                        .as("Body types of %s %s", brand, m.getName())
                                        .containsAll(m.getSupportedBodyTypes());
                            }
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
            assertThat(brandTypes.get("OTHER")).contains("CAR", "COMMERCIAL", "TRUCK");

            assertThat(totalModelsChecked).isGreaterThan(500);
        }
    }

    @Nested
    @DisplayName("VehicleHierarchyValidator version rules")
    class VersionHierarchyTests {

        private final VehicleHierarchyValidator hierarchyValidator = new VehicleHierarchyValidator();

        private VehicleListing listingWith(VehicleGeneration listingGeneration, VehicleVersion version, Integer year) {
            VehicleType type = createType("CAR");
            CarBrand brand = new CarBrand();
            brand.setId(UUID.randomUUID());
            VehicleModel model = new VehicleModel();
            model.setId(UUID.randomUUID());
            model.setBrand(brand);
            model.setType(type);
            if (listingGeneration != null) {
                listingGeneration.setModel(model);
            }
            return VehicleListing.builder()
                    .vehicleType(type)
                    .brand(brand)
                    .model(model)
                    .generation(listingGeneration)
                    .vehicleVersion(version)
                    .year(year)
                    .build();
        }

        private VehicleGeneration generation(Integer start, Integer end) {
            VehicleGeneration g = new VehicleGeneration();
            g.setId(UUID.randomUUID());
            g.setStartYear(start);
            g.setEndYear(end);
            return g;
        }

        private VehicleVersion version(VehicleGeneration g, Integer start, Integer end) {
            VehicleVersion v = new VehicleVersion();
            v.setId(UUID.randomUUID());
            v.setGeneration(g);
            v.setStartYear(start);
            v.setEndYear(end);
            return v;
        }

        @Test
        void acceptsVersionOfSelectedGenerationInsideYears() {
            VehicleGeneration g = generation(2020, null);
            Result<Void> result = hierarchyValidator.validate(listingWith(g, version(g, null, null), 2022));
            assertThat(result.isSuccess()).isTrue();
        }

        @Test
        void requiresGenerationForVersion() {
            Result<Void> result = hierarchyValidator.validate(listingWith(null, version(generation(2020, null), null, null), 2022));
            assertThat(result.getErrorCode()).isEqualTo("VERSION_REQUIRES_GENERATION");
        }

        @Test
        void rejectsVersionOfAnotherGeneration() {
            VehicleGeneration selected = generation(2020, null);
            VehicleVersion other = version(generation(2012, 2019), null, null);
            Result<Void> result = hierarchyValidator.validate(listingWith(selected, other, 2022));
            assertThat(result.getErrorCode()).isEqualTo("VERSION_GENERATION_MISMATCH");
        }

        @Test
        void rejectsYearOutsideVersionYears() {
            VehicleGeneration g = generation(2020, null);
            Result<Void> result = hierarchyValidator.validate(listingWith(g, version(g, 2021, 2023), 2024));
            assertThat(result.getErrorCode()).isEqualTo("VEHICLE_YEAR_OUT_OF_VERSION_RANGE");
        }

        @Test
        void usesGenerationYearsWhenVersionHasNone() {
            VehicleGeneration g = generation(2020, null);
            Result<Void> result = hierarchyValidator.validate(listingWith(g, version(g, null, null), 2019));
            assertThat(result.getErrorCode()).isEqualTo("VEHICLE_YEAR_OUT_OF_VERSION_RANGE");
        }

        @Test
        void rejectsTrimNotOfferedWithVersion() {
            VehicleGeneration g = generation(2020, null);
            VehicleVersion v = version(g, null, null);
            VehicleTrim offered = new VehicleTrim();
            offered.setId(UUID.randomUUID());
            offered.setGeneration(g);
            v.getTrims().add(offered);
            VehicleTrim other = new VehicleTrim();
            other.setId(UUID.randomUUID());
            other.setGeneration(g);

            VehicleListing listing = listingWith(g, v, 2022);
            listing.setTrim(other);
            assertThat(hierarchyValidator.validate(listing).getErrorCode()).isEqualTo("TRIM_VERSION_MISMATCH");

            listing.setTrim(offered);
            assertThat(hierarchyValidator.validate(listing).isSuccess()).isTrue();
        }
    }
}
