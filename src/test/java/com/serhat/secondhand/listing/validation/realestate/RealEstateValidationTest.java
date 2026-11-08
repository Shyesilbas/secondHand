package com.serhat.secondhand.listing.validation.realestate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateCategory;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Rules come from the real data/realestate/realestate.json, so these tests also guard the seed data. */
class RealEstateValidationTest {

    private static final Map<String, RealEstateType> TYPES = new HashMap<>();
    private static JsonNode catalog;

    private RealEstateSpecCatalogService specs;
    private RealEstateTypeRulesValidator validator;

    @BeforeAll
    static void loadTypes() throws Exception {
        try (InputStream is = new ClassPathResource("data/realestate/realestate.json").getInputStream()) {
            catalog = new ObjectMapper().readTree(is);
        }
        for (JsonNode node : catalog.get("propertyTypes")) {
            RealEstateType type = new RealEstateType();
            type.setId(UUID.fromString(node.get("id").asText()));
            type.setName(node.get("key").asText());
            type.setLabel(node.get("label").asText());
            type.setCategory(RealEstateCategory.valueOf(node.get("category").asText()));
            Map<String, SpecFieldRule> rules = new LinkedHashMap<>();
            node.get("fields").fields().forEachRemaining(e -> rules.put(e.getKey(), SpecFieldRule.valueOf(e.getValue().asText())));
            type.setFieldRules(rules);
            TYPES.put(type.getName(), type);
        }
    }

    @BeforeEach
    void setUp() {
        specs = new RealEstateSpecCatalogService(new ObjectMapper());
        specs.init();
        validator = new RealEstateTypeRulesValidator(specs);
    }

    private static RealEstateAdType adType(String name) {
        RealEstateAdType ad = new RealEstateAdType();
        ad.setId(UUID.randomUUID());
        ad.setName(name);
        ad.setLabel(name);
        return ad;
    }

    private static RealEstateListing listing(String type, String adType) {
        RealEstateListing listing = new RealEstateListing();
        listing.setRealEstateType(TYPES.get(type));
        listing.setAdType(adType(adType));
        listing.setAttributes(new LinkedHashMap<>());
        return listing;
    }

    private static RealEstateListing apartment() {
        RealEstateListing l = listing("APARTMENT", "FOR_SALE");
        HeatingType heating = new HeatingType();
        heating.setId(UUID.randomUUID());
        heating.setName("COMBI_BOILER");
        heating.setLabel("Kombi");
        l.setHeatingType(heating);
        l.setGrossAreaM2(120);
        l.setNetAreaM2(100);
        l.setRoomConfigKey("ROOM_3_1");
        l.setFloorKey("FLOOR_3");
        l.setTotalFloors(8);
        l.setBuildingAge(10);
        return l;
    }

    private Result<Void> run(RealEstateListing listing) {
        validator.cleanup(listing);
        return validator.validate(listing);
    }

    @Test
    void everyTypeRulesEveryFieldAndNoToggleIsRequired() {
        for (RealEstateType type : TYPES.values()) {
            assertThat(type.getFieldRules().keySet()).as(type.getName()).isEqualTo(RealEstateSpecFields.ALL.keySet());
            RealEstateSpecFields.ALL.values().stream().filter(RealEstateSpecFields.Field::toggle)
                    .forEach(f -> assertThat(type.getFieldRules().get(f.name())).as(type.getName() + "." + f.name())
                            .isNotEqualTo(SpecFieldRule.REQUIRED));
        }
        assertThat(catalog.get("adTypes")).extracting(n -> n.get("key").asText()).containsExactly("FOR_SALE", "FOR_RENT");
    }

    @Test
    void apartmentDerivesRoomCountAndFloorNumber() {
        RealEstateListing l = apartment();
        assertThat(run(l).isSuccess()).isTrue();
        assertThat(l.getRoomCount()).isEqualTo(3);
        assertThat(l.getFloorNumber()).isEqualTo(3);
    }

    @Test
    void roofFloorTakesTheTotalFloors() {
        RealEstateListing l = apartment();
        l.setFloorKey("ROOF");
        assertThat(run(l).isSuccess()).isTrue();
        assertThat(l.getFloorNumber()).isEqualTo(8);
    }

    @Test
    void apartmentNeedsRoomPlanHeatingAndFloor() {
        RealEstateListing noRooms = apartment();
        noRooms.setRoomConfigKey(" ");
        assertThat(run(noRooms).getErrorCode()).isEqualTo("REAL_ESTATE_ROOM_CONFIG_KEY_REQUIRED");

        RealEstateListing noHeating = apartment();
        noHeating.setHeatingType(null);
        assertThat(run(noHeating).getErrorCode()).isEqualTo("REAL_ESTATE_HEATING_TYPE_REQUIRED");

        RealEstateListing noFloor = apartment();
        noFloor.setFloorKey(null);
        assertThat(run(noFloor).getErrorCode()).isEqualTo("REAL_ESTATE_FLOOR_KEY_REQUIRED");
    }

    @Test
    void rejectsImpossibleValues() {
        RealEstateListing aboveTop = apartment();
        aboveTop.setFloorKey("FLOOR_9");
        assertThat(run(aboveTop).getErrorCode()).isEqualTo("REAL_ESTATE_FLOOR_ABOVE_TOTAL");

        RealEstateListing netAboveGross = apartment();
        netAboveGross.setNetAreaM2(130);
        assertThat(run(netAboveGross).getErrorCode()).isEqualTo("REAL_ESTATE_NET_AREA_ABOVE_GROSS");

        RealEstateListing unknownRooms = apartment();
        unknownRooms.setRoomConfigKey("3+1");
        assertThat(run(unknownRooms).getErrorCode()).isEqualTo("INVALID_ROOM_CONFIG_KEY");

        RealEstateListing unknownFloor = apartment();
        unknownFloor.setFloorKey("FLOOR_99");
        assertThat(run(unknownFloor).getErrorCode()).isEqualTo("INVALID_FLOOR_KEY");
    }

    @Test
    void landClearsBuildingFieldsAndNeedsZoning() {
        RealEstateListing land = apartment();
        land.setRealEstateType(TYPES.get("COMMERCIAL_LAND"));
        land.setFurnished(true);
        land.setHasElevator(true);
        assertThat(run(land).getErrorCode()).isEqualTo("REAL_ESTATE_ZONING_STATUS_KEY_REQUIRED");
        assertThat(land.getRoomConfigKey()).isNull();
        assertThat(land.getRoomCount()).isNull();
        assertThat(land.getHeatingType()).isNull();
        assertThat(land.getFloorKey()).isNull();
        assertThat(land.getFloorNumber()).isNull();
        assertThat(land.isFurnished()).isFalse();
        assertThat(land.isHasElevator()).isFalse();

        land.setZoningStatusKey("COMMERCIAL_ZONED");
        assertThat(run(land).isSuccess()).isTrue();
    }

    @Test
    void residentialClearsLandFields() {
        RealEstateListing l = apartment();
        l.setZoningStatusKey("RESIDENTIAL_ZONED");
        l.setParcelNo("12");
        assertThat(run(l).isSuccess()).isTrue();
        assertThat(l.getZoningStatusKey()).isNull();
        assertThat(l.getParcelNo()).isNull();
    }

    @Test
    void attributesOfTheOtherAdTypeAreDropped() {
        RealEstateListing sale = apartment();
        sale.getAttributes().putAll(Map.of("deposit", 40000, "minLeaseMonths", 12, "loanEligible", true));
        run(sale);
        assertThat(sale.getAttributes()).containsOnlyKeys("loanEligible");

        RealEstateListing rent = apartment();
        rent.setAdType(adType("FOR_RENT"));
        rent.getAttributes().putAll(Map.of("deposit", 40000, "minLeaseMonths", 12, "loanEligible", true));
        run(rent);
        assertThat(rent.getAttributes()).containsOnlyKeys("deposit", "minLeaseMonths");
    }

    @Test
    void siteNameIsClearedOutsideASite() {
        RealEstateListing l = apartment();
        l.setSiteName("Deniz Konakları");
        run(l);
        assertThat(l.getSiteName()).isNull();
    }

    @Test
    void specCatalogServesFloorsAndInfrastructure() {
        assertThat(specs.findFloor("BASEMENT")).get().extracting(RealEstateSpecCatalogService.SpecDto::getNumber).isEqualTo(-1);
        assertThat(specs.findFloor("FLOOR_40")).isPresent();
        assertThat(specs.isValidInfrastructureStatus("PARTIAL")).isTrue();
        assertThat(specs.isValidRoomConfig("ROOM_8_PLUS")).isTrue();
    }
}
